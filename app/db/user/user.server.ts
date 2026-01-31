import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { StatusResponse, QUser, AcceptenceState } from "~/types/types";
import { sendEmail } from "~/lib/send-email.server";
import bcrypt from "bcryptjs";

const initializeDatabase = (dbUrl?: string) => {
  const db = dbUrl ? client(dbUrl) : client();
  if (!db) {
    throw new Error("فشل الاتصال بقاعدة البيانات");
  }
  return db;
};

const transformUser = (user: any) => {
  if (!user) return null;
  return {
    ...user,
    phone: user.phone?.toString() || null
  };
};

const editUserRegisteration = async (
  userId: string,
  status: AcceptenceState,
  dbUrl?: string,
  emailConfig?: {
    resendApi: string;
    mainEmail: string;
    userEmail: string;
  }
): Promise<StatusResponse<void>> => {
  const db = initializeDatabase(dbUrl);

  // Initialize emailConfig with defaults if not provided
  const config = {
    resendApi: emailConfig?.resendApi || process.env.RESEND_API || "",
    mainEmail: emailConfig?.mainEmail || process.env.MAIN_EMAIL || "",
    userEmail: emailConfig?.userEmail || "",
  };

  try {
    // Fetch user details
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return { status: "error", message: "User not found" };
    }

    // Set userEmail if not provided
    if (!config.userEmail) {
      config.userEmail = user.email;
    }

    // Update the user status
    await db.user.update({
      data: { acceptenceState: status },
      where: { id: userId },
    });

    // Send email notification based on status
    if (config.resendApi && config.mainEmail && config.userEmail) {
      const emailSubject =
        status === "idle"
          ? glossary.email.suspension_message
          : glossary.email.program_status_subject;

      await sendEmail(
        {
          to: config.userEmail,
          subject: emailSubject,
          template: "program-status",
          props: { status, name: user.name || "" },
          text: "",
        },
        config.resendApi,
        config.mainEmail
      );
    }

    return {
      status: "success",
      message:
        glossary.status_response.success[
          status === "accepted" ? "user_accepted" : "user_denied"
        ],
    };
  } catch (error) {
    return {
      status: "error",
      message:
        glossary.status_response.error[
          status === "accepted" ? "user_accepted" : "user_denied"
        ],
    };
  }
};

const bulkEditUserRegisteration = async (
  userIds: string[],
  status: "accepted" | "denied",
  dbUrl?: string
): Promise<StatusResponse<void>> => {
  const db = initializeDatabase(dbUrl);

  try {
    await db.user.updateMany({
      data: { acceptenceState: status },
      where: { id: { in: userIds } },
    });

    return {
      status: "success",
      message:
        glossary.status_response.success[
          status === "accepted" ? "user_accepted" : "user_denied"
        ],
    };
  } catch (error) {
    return {
      status: "error",
      message:
        glossary.status_response.error[
          status === "accepted" ? "user_accepted" : "user_denied"
        ],
    };
  }
};

const getAllUsers = (dbUrl?: string): Promise<StatusResponse<QUser[]>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    if (!db) {
      reject({
        status: "error",
        message: "Database connection failed.",
      });
      return;
    }
    db.user
      .findMany({
        orderBy: {
          name: 'asc'
        }
      })
      .then(async (users) => {
        // Get all unique IDs for batch fetching
        const regionIds = [...new Set(
          users.map(u => u.regionId)
            .filter((id): id is string => id !== null && id !== undefined)
        )];

        const eduAdminIds = [...new Set(
          users.map(u => u.eduAdminId)
            .filter((id): id is string => id !== null && id !== undefined)
        )];

        const schoolIds = [...new Set(
          users.map(u => u.schoolId)
            .filter((id): id is string => id !== null && id !== undefined)
        )];
        // Fetch all related data in parallel
        const [regions, eduAdmins, schools] = await Promise.all([
          regionIds.length > 0 ? db.region.findMany({
            where: { id: { in: regionIds } },
            select: { id: true, name: true }
          }) : [],
          eduAdminIds.length > 0 ? db.eduAdmin.findMany({
            where: { id: { in: eduAdminIds } },
            select: { id: true, name: true }
          }) : [],
          schoolIds.length > 0 ? db.school.findMany({
            where: { id: { in: schoolIds } },
            select: { id: true, name: true }
          }) : []
        ]);

        // Create lookup maps for O(1) access
        const regionMap = new Map(regions.map(r => [r.id, r.name]));
        const eduAdminMap = new Map(eduAdmins.map(e => [e.id, e.name]));
        const schoolMap = new Map(schools.map(s => [s.id, s.name]));

        // Transform users with names
        const transformedUsers = users.map(user => ({
          ...user,
          regionName: user.regionId ? regionMap.get(user.regionId) || null : null,
          eduAdminName: user.eduAdminId ? eduAdminMap.get(user.eduAdminId) || null : null,
          schoolName: user.schoolId ? schoolMap.get(user.schoolId) || null : null,
          // Create relation objects for compatibility with your test page
          userRegion: user.regionId ? { id: user.regionId, name: regionMap.get(user.regionId) || null } : null,
          userEduAdmin: user.eduAdminId ? { id: user.eduAdminId, name: eduAdminMap.get(user.eduAdminId) || null } : null,
          userSchool: user.schoolId ? { id: user.schoolId, name: schoolMap.get(user.schoolId) || null } : null
        })) as QUser[];

        resolve({ status: "success", data: transformedUsers });
      })
      .catch((error: any) => {
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const getUser = 
(id: string, dbUrl?: string): 
Promise<StatusResponse<QUser>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    if (!db) {
      reject({
        status: "error",
        message: "Database connection failed.",
      });
      return;
    }
    db.user
      .findFirstOrThrow({
        where: { id },
      })
      .then( async (res) => {
        // If regionId exists, fetch region name
        let regionName: string | null = null;
        if (res.regionId) {
          const region = await db.region.findUnique({
            where: { id: res.regionId },
            select: { name: true }
          });
          regionName = region?.name || null;
        }

        // If eduAdminId exists, fetch eduAdmin name
        let eduAdminName: string | null = null;
        if (res.eduAdminId) {
          const eduAdmin = await db.eduAdmin.findUnique({
            where: { id: res.eduAdminId },
            select: { name: true }
          });
          eduAdminName = eduAdmin?.name || null;
        }
        // If schoolId exists, fetch school name
        let schoolName: string | null = null;
        if (res.schoolId) {
          const school = await db.school.findUnique({
            where: { id: res.schoolId },
            select: { name: true }
          });
          schoolName = school?.name || null;
        }
        // Attach names to user object
        (res as QUser).regionName = regionName;
        (res as QUser).eduAdminName = eduAdminName;
        (res as QUser).schoolName = schoolName;
        const transformedUser = transformUser(res) as QUser;
        resolve({ status: "success", data: transformedUser });
      })
      .catch((error: any) => {
        
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const getUserByEmail = (email: string, dbUrl?: string): Promise<StatusResponse<QUser | null>> => {
  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.user
      .findUnique({
        where: { email },
      })
      .then((user) => {
        if (!user) {
          resolve({ status: "error", message: "لم يتم العثور على المستخدم", data: null });
        } else {
          resolve({ status: "success", data: user });
        }
      })
      .catch((error: any) => {
        
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const createUser = (userData: {
  name: string,
  email: string,
  password: string,
  phone?: string,
  role: string,
  regionId?: string,
  eduAdminId?: string,
  schoolId?: string,
  acceptenceState?: string
}, dbUrl?: string, emailConfig?: { resendApi: string, mainEmail: string }): Promise<StatusResponse<null>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise(async (resolve, reject) => {
    if (!db) {
      reject({
        status: "error",
        message: "Database connection failed.",
      });
      return;
    }

    try {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        reject({
          status: "error",
          message: "البريد الإلكتروني مسجل مسبقاً",
        });
        return;
      }

      // Generate required fields for Prisma
      const now = new Date();
      const userId = crypto.randomUUID();
      const accountId = crypto.randomUUID();

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user and account in a transaction
      await db.$transaction(async (tx) => {
        // Create user
        await tx.user.create({
          data: {
            id: userId,
            name: userData.name,
            email: userData.email,
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
            role: userData.role,
            phone: userData.phone ? parseInt(userData.phone, 10) : null,
            regionId: userData.regionId,
            eduAdminId: userData.eduAdminId,
            schoolId: userData.schoolId,
            acceptenceState: userData.acceptenceState || "pending"
          }
        });

        // Create account with password (for better-auth credential login)
        await tx.account.create({
          data: {
            id: accountId,
            accountId: userId,
            providerId: "credential",
            userId: userId,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now
          }
        });
      });

      // Send email notification if email is provided
      if (userData.email) {
        emailConfig = emailConfig || {
          resendApi: process.env.RESEND_API || "",
          mainEmail: process.env.MAIN_EMAIL || "",
        };
        try {
          await sendEmail({
            to: userData.email,
            subject: glossary.email.program_status_subject,
            template: "user-registration",
            props: { name: userData.name },
            text: '',
          }, emailConfig.resendApi, emailConfig.mainEmail);
        } catch (emailError) {
          // Don't fail user creation if email fails
        }
      }

      resolve({
        status: "success",
        message: "تم إنشاء المستخدم بنجاح",
      });
    } catch (error: any) {
      reject({
        status: "error",
        message: error.message || "فشل إنشاء المستخدم",
      });
    }
  });
};

const updateUser = (id: string, userData: {
  name?: string,
  email?: string,
  password?: string,
  phone?: string,
  role?: string,
  regionId?: string | null,
  eduAdminId?: string | null,
  schoolId?: string | null
}, dbUrl?: string): Promise<StatusResponse<null>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise(async (resolve, reject) => {
    try {
      // Separate password from other user data
      const { password, ...userUpdateData } = userData;

      // Convert phone from string to number for Prisma
      const prismaData: any = { ...userUpdateData };
      if (userUpdateData.phone !== undefined) {
        prismaData.phone = userUpdateData.phone ? parseInt(userUpdateData.phone, 10) : null;
      }

      // Update user data
      if (Object.keys(prismaData).length > 0) {
        await db.user.update({
          where: { id },
          data: prismaData
        });
      }

      // Update password in Account table if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date();

        // Find the credential account for this user
        const existingAccount = await db.account.findFirst({
          where: {
            userId: id,
            providerId: "credential"
          }
        });

        if (existingAccount) {
          // Update existing account password
          await db.account.update({
            where: { id: existingAccount.id },
            data: {
              password: hashedPassword,
              updatedAt: now
            }
          });
        } else {
          // Create new credential account if doesn't exist
          const accountId = crypto.randomUUID();
          await db.account.create({
            data: {
              id: accountId,
              accountId: id,
              providerId: "credential",
              userId: id,
              password: hashedPassword,
              createdAt: now,
              updatedAt: now
            }
          });
        }
      }

      resolve({
        status: "success",
        message: "تم تحديث المستخدم بنجاح",
      });
    } catch (error: any) {
      reject({
        status: "error",
        message: error.message || "فشل تحديث المستخدم",
      });
    }
  });
};

const deleteUser = (id: string, dbUrl?: string): Promise<StatusResponse<null>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise(async (resolve, reject) => {
    try {
      // First, get the user's data for cleanup
      const user = await db.user.findUnique({
        where: { id },
        select: { 
          email: true, 
          regionId: true, 
          eduAdminId: true, 
          schoolId: true 
        }
      });

      if (!user) {
        reject({
          status: "error",
          message: "المستخدم غير موجود",
        });
        return;
      }

      
      
      
      

      // First, let's check if the referenced entities exist
      if (user.regionId) {
        try {
          const region = await db.region.findUnique({ where: { id: user.regionId } });
          
        } catch (error) {
          
        }
      }

      if (user.eduAdminId) {
        try {
          const eduAdmin = await db.eduAdmin.findUnique({ where: { id: user.eduAdminId } });
          
        } catch (error) {
          
        }
      }

      if (user.schoolId) {
        try {
          const school = await db.school.findUnique({ where: { id: user.schoolId } });
          
        } catch (error) {
          
        }
      }

      // Use a transaction to ensure all deletions succeed or fail together
      await db.$transaction(async (tx) => {
        // Delete related records first to avoid foreign key constraint errors
        
        
        const userReports = await tx.report.findMany({
          where: { userId: id },
          select: { id: true }
        });
        const reportIds = userReports.map(report => report.id);
        

        if (reportIds.length > 0) {
          
          const skillReportDeleteResult = await tx.skillReport.deleteMany({
            where: { reportId: { in: reportIds } }
          });
          

          
          const testimonialReportDeleteResult = await tx.testimonialReport.deleteMany({
            where: { reportId: { in: reportIds } }
          });
          
        }

        
        const reportDeleteResult = await tx.report.deleteMany({
          where: { userId: id }
        });
        
        
        
        const sentMessagesResult = await tx.message.deleteMany({
          where: { fromUserId: id }
        });
        
        
        
        const receivedMessagesResult = await tx.message.deleteMany({
          where: { toUserId: id }
        });
        

        
        const verificationResult = await tx.verification.deleteMany({
          where: { identifier: user.email }
        });
        
        
        
        // Clear any foreign key references that might cause issues
        await tx.user.update({
          where: { id },
          data: {
            regionId: null,
            eduAdminId: null,
            schoolId: null
          }
        });
        
        
        
        // Check how many sessions and accounts exist for this user
        const sessionsCount = await tx.session.count({ where: { userId: id } });
        const accountsCount = await tx.account.count({ where: { userId: id } });
        

        // Explicitly delete sessions and accounts (even though they should cascade)
        if (sessionsCount > 0) {
          const deletedSessions = await tx.session.deleteMany({ where: { userId: id } });
          
        }
        
        if (accountsCount > 0) {
          const deletedAccounts = await tx.account.deleteMany({ where: { userId: id } });
          
        }

        
        try {
          // Finally delete the user (remaining cascades: certificates)
          await tx.user.delete({
            where: { id }
          });
          
        } catch (deleteError: any) {
          
          
          
          throw deleteError; // Re-throw to trigger transaction rollback
        }
      });

      
      
      // Verify deletion by trying to find the user
      try {
        const deletedUser = await db.user.findUnique({ where: { id } });
        if (deletedUser) {
          
          reject({
            status: "error",
            message: "فشل في حذف المستخدم - لا يزال موجوداً في قاعدة البيانات",
          });
          return;
        } else {
          
        }
      } catch (verifyError) {
        
      }
      
      resolve({
        status: "success",
        message: "تم حذف المستخدم بنجاح",
      });
    } catch (error: any) {
      
      
      
      
      // Provide more specific error messages based on the error type
      let errorMessage = "فشل حذف المستخدم";
      
      if (error.code === 'P2003') {
        errorMessage = "لا يمكن حذف المستخدم بسبب وجود بيانات مرتبطة به";
        
      } else if (error.code === 'P2025') {
        errorMessage = "المستخدم غير موجود";
        
      } else if (error.message && error.message.includes('timeout')) {
        errorMessage = "انتهت مهلة العملية. الرجاء المحاولة مرة أخرى";
        
      }
      
      reject({
        status: "error",
        message: errorMessage,
        details: error.message,
        code: error.code
      });
    }
  });
};

// Function to get users by region
const getUsersByRegion = (regionId: string, dbUrl?: string): Promise<StatusResponse<QUser[]>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.user
      .findMany({
        where: { regionId },
        orderBy: {
          name: 'asc'
        }
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

// Function to get users by eduAdmin
const getUsersByEduAdmin = (eduAdminId: string, dbUrl?: string): Promise<StatusResponse<QUser[]>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.user
      .findMany({
        where: { eduAdminId },
        orderBy: {
          name: 'asc'
        }
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

// Function to get users by school
const getUsersBySchool = (schoolId: string, dbUrl?: string): Promise<StatusResponse<QUser[]>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.user
      .findMany({
        where: { schoolId },
        orderBy: {
          name: 'asc'
        }
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

/**
 * Get user details including certificates
 */
const getUserWithCertificates = (userId: string, dbUrl?: string): Promise<StatusResponse<any>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.user
      .findUnique({
        where: { id: userId },
        include: {
          UserCertificate: true,
        }
      })
      .then((user) => {
        if (!user) {
          reject({
            status: "error",
            message: "لم يتم العثور على المستخدم",
          });
          return;
        }
        resolve({
          status: "success",
          data: user
        });
      })
      .catch((error) => {
        
        reject({
          status: "error",
          message: "فشل في الحصول على بيانات المستخدم",
        });
      });
  });
};


const addCertificateToUser = (
  certificateData: {
    userId: string;
    certificateKey: string;
    size: number;
    contentType: string;
    name: string;
  },
  dbUrl?: string
): Promise<StatusResponse<null>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.userCertificate
      .create({
        data: {
          userId: certificateData.userId,
          certificateKey: certificateData.certificateKey,
          size: certificateData.size,
          contentType: certificateData.contentType,
          name: certificateData.name,
        },
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم إضافة الشهادة للمستخدم بنجاح",
        });
      })
      .catch((error) => {

        reject({
          status: "error",
          message: "فشل إضافة الشهادة للمستخدم",
        });
      });
  });
};

/**
 * Check if a string looks like a valid CUID (not a name)
 */
const isValidCuid = (str: string | null): boolean => {
  if (!str) return true; // null is valid (no reference)
  // CUIDs are alphanumeric and start with 'c'
  return /^c[a-z0-9]{24,}$/i.test(str);
};

/**
 * Backup users who have entity names stored in ID fields
 * Returns the data that can be used to restore if migration fails
 */
const backupUsersWithInvalidIds = async (dbUrl?: string): Promise<StatusResponse<{
  backupDate: string;
  usersCount: number;
  users: Array<{
    id: string;
    eduAdminId: string | null;
    schoolId: string | null;
    regionId: string | null;
  }>;
}>> => {
  const db = initializeDatabase(dbUrl);

  try {
    // Get all users
    const allUsers = await db.user.findMany({
      select: { id: true, eduAdminId: true, schoolId: true, regionId: true }
    });

    // Filter users with names in ID fields
    const usersToBackup = allUsers.filter(
      u => !isValidCuid(u.eduAdminId) || !isValidCuid(u.schoolId)
    );

    console.log(`Backing up ${usersToBackup.length} users with invalid IDs`);

    return {
      status: "success",
      data: {
        backupDate: new Date().toISOString(),
        usersCount: usersToBackup.length,
        users: usersToBackup
      },
      message: `تم حفظ نسخة احتياطية لـ ${usersToBackup.length} مستخدم`
    };
  } catch (error: any) {
    console.log("ERROR [backupUsersWithInvalidIds]: ", error);
    return {
      status: "error",
      message: "فشل إنشاء النسخة الاحتياطية",
      data: {
        backupDate: new Date().toISOString(),
        usersCount: 0,
        users: []
      }
    };
  }
};

/**
 * Restore users from backup data
 * Use this if migration produces unexpected results
 */
const restoreUsersFromBackup = async (
  backupData: Array<{
    id: string;
    eduAdminId: string | null;
    schoolId: string | null;
  }>,
  dbUrl?: string
): Promise<StatusResponse<{ restored: number }>> => {
  const db = initializeDatabase(dbUrl);

  try {
    let restored = 0;

    for (const user of backupData) {
      await db.user.update({
        where: { id: user.id },
        data: {
          eduAdminId: user.eduAdminId,
          schoolId: user.schoolId
        }
      });
      restored++;
    }

    console.log(`Restored ${restored} users from backup`);

    return {
      status: "success",
      data: { restored },
      message: `تم استعادة ${restored} مستخدم من النسخة الاحتياطية`
    };
  } catch (error: any) {
    console.log("ERROR [restoreUsersFromBackup]: ", error);
    return {
      status: "error",
      message: "فشل استعادة النسخة الاحتياطية",
      data: { restored: 0 }
    };
  }
};

/**
 * Migrate users who have entity names stored in ID fields
 * This fixes old data where eduAdminId/schoolId contain names instead of IDs
 */
const migrateUserEntityIds = async (dbUrl?: string): Promise<StatusResponse<{
  eduAdminMatched: number;
  eduAdminUnmatched: number;
  schoolMatched: number;
  schoolUnmatched: number;
  unmatchedEduAdmins: string[];
  unmatchedSchools: string[];
}>> => {
  const db = initializeDatabase(dbUrl);

  try {
    // Get all users
    const allUsers = await db.user.findMany({
      select: { id: true, eduAdminId: true, schoolId: true, regionId: true }
    });

    // Filter users with names in ID fields
    const usersToMigrate = allUsers.filter(
      u => !isValidCuid(u.eduAdminId) || !isValidCuid(u.schoolId)
    );

    console.log(`Found ${usersToMigrate.length} users to migrate`);

    // Get all eduAdmins and schools for matching
    const [eduAdmins, schools] = await Promise.all([
      db.eduAdmin.findMany({ select: { id: true, name: true, regionId: true } }),
      db.school.findMany({ select: { id: true, name: true, eduAdminId: true } })
    ]);

    // Create lookup maps (name -> entities array)
    const eduAdminByName = new Map<string, Array<{ id: string; name: string; regionId: string | null }>>();
    eduAdmins.forEach(e => {
      const key = e.name.trim();
      if (!eduAdminByName.has(key)) eduAdminByName.set(key, []);
      eduAdminByName.get(key)!.push(e);
    });

    const schoolByName = new Map<string, Array<{ id: string; name: string; eduAdminId: string | null }>>();
    schools.forEach(s => {
      const key = s.name.trim();
      if (!schoolByName.has(key)) schoolByName.set(key, []);
      schoolByName.get(key)!.push(s);
    });

    let eduAdminMatched = 0, eduAdminUnmatched = 0;
    let schoolMatched = 0, schoolUnmatched = 0;
    const unmatchedEduAdmins = new Set<string>();
    const unmatchedSchools = new Set<string>();

    for (const user of usersToMigrate) {
      const updates: { eduAdminId?: string; schoolId?: string } = {};

      // Fix eduAdminId if it contains a name
      if (user.eduAdminId && !isValidCuid(user.eduAdminId)) {
        const eduAdminName = user.eduAdminId.trim();
        const matches = eduAdminByName.get(eduAdminName) || [];

        // Try to find exact match, prefer one in same region
        const matchedEduAdmin = matches.find(e => e.regionId === user.regionId) || matches[0];

        if (matchedEduAdmin) {
          updates.eduAdminId = matchedEduAdmin.id;
          eduAdminMatched++;
        } else {
          // No match found - keep the original value (don't clear it)
          unmatchedEduAdmins.add(eduAdminName);
          eduAdminUnmatched++;
        }
      }

      // Fix schoolId if it contains a name
      if (user.schoolId && !isValidCuid(user.schoolId)) {
        const schoolName = user.schoolId.trim();
        const matches = schoolByName.get(schoolName) || [];

        // Try to find exact match, prefer one under same eduAdmin
        const newEduAdminId = updates.eduAdminId ?? user.eduAdminId;
        const validEduAdminId = isValidCuid(newEduAdminId) ? newEduAdminId : null;
        const matchedSchool = matches.find(s => s.eduAdminId === validEduAdminId) || matches[0];

        if (matchedSchool) {
          updates.schoolId = matchedSchool.id;
          schoolMatched++;
        } else {
          // No match found - keep the original value (don't clear it)
          unmatchedSchools.add(schoolName);
          schoolUnmatched++;
        }
      }

      // Apply updates only if we found matches
      if (Object.keys(updates).length > 0) {
        await db.user.update({
          where: { id: user.id },
          data: updates
        });
      }
    }

    console.log(`Migration complete: ${eduAdminMatched} eduAdmins matched, ${schoolMatched} schools matched`);

    return {
      status: "success",
      data: {
        eduAdminMatched,
        eduAdminUnmatched,
        schoolMatched,
        schoolUnmatched,
        unmatchedEduAdmins: Array.from(unmatchedEduAdmins),
        unmatchedSchools: Array.from(unmatchedSchools)
      },
      message: `تم ربط ${eduAdminMatched} إدارة تعليمية و ${schoolMatched} مدرسة`
    };
  } catch (error: any) {
    console.log("ERROR [migrateUserEntityIds]: ", error);
    return {
      status: "error",
      message: "فشل عملية الترحيل",
      data: {
        eduAdminMatched: 0,
        eduAdminUnmatched: 0,
        schoolMatched: 0,
        schoolUnmatched: 0,
        unmatchedEduAdmins: [],
        unmatchedSchools: []
      }
    };
  }
};

/**
 * Get backup data for users by their emails
 * Returns user data and account data for backup before bulk operations
 */
const getUsersBackupByEmails = async (
  emails: string[],
  dbUrl?: string
): Promise<StatusResponse<{
  timestamp: string;
  totalEmails: number;
  foundUsers: number;
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    createdAt: Date;
    acceptenceState: string | null;
    hasAccount: boolean;
    accountId?: string;
  }>;
  notFoundEmails: string[];
}>> => {
  const db = initializeDatabase(dbUrl);

  try {
    // Normalize emails
    const normalizedEmails = emails.map(e => e.trim().toLowerCase());
    const uniqueEmails = [...new Set(normalizedEmails)];

    // Find users
    const users = await db.user.findMany({
      where: {
        email: { in: uniqueEmails }
      }
    });

    // Get user IDs to find their accounts
    const userIds = users.map(u => u.id);

    // Find accounts for these users
    const accounts = await db.account.findMany({
      where: {
        userId: { in: userIds }
      },
      select: {
        id: true,
        userId: true
      }
    });

    // Create a map of userId to accountId
    const userAccountMap = new Map(accounts.map(a => [a.userId, a.id]));

    // Map found users
    const foundUserEmails = new Set(users.map(u => u.email.toLowerCase()));
    const notFoundEmails = uniqueEmails.filter(e => !foundUserEmails.has(e));

    const backupData = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone?.toString() || null,
      createdAt: user.createdAt,
      acceptenceState: user.acceptenceState,
      hasAccount: userAccountMap.has(user.id),
      accountId: userAccountMap.get(user.id)
    }));

    return {
      status: "success",
      message: `تم تجهيز نسخة احتياطية لـ ${users.length} مستخدم`,
      data: {
        timestamp: new Date().toISOString(),
        totalEmails: uniqueEmails.length,
        foundUsers: users.length,
        users: backupData,
        notFoundEmails
      }
    };
  } catch (error) {
    console.log("ERROR [getUsersBackupByEmails]: ", error);
    return {
      status: "error",
      message: "حدث خطأ أثناء تجهيز النسخة الاحتياطية"
    };
  }
};

/**
 * Bulk fix user accounts - reset passwords for existing users or create new accounts
 * Used to fix users who have login/password issues
 */
const bulkFixUserAccounts = async (
  users: Array<{
    email: string;
    name: string;
    phone?: string;
    regionName?: string;
    schoolName?: string;
  }>,
  defaultPassword: string,
  dbUrl?: string
): Promise<StatusResponse<{
  processed: number;
  passwordReset: number;
  created: number;
  skipped: number;
  errors: Array<{ email: string; error: string }>;
}>> => {
  const db = initializeDatabase(dbUrl);

  const results = {
    processed: 0,
    passwordReset: 0,
    created: 0,
    skipped: 0,
    errors: [] as Array<{ email: string; error: string }>
  };

  try {
    // Hash the default password once
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Deduplicate by email (keep first occurrence)
    const emailsSeen = new Set<string>();
    const uniqueUsers = users.filter(u => {
      const normalizedEmail = u.email.trim().toLowerCase();
      if (emailsSeen.has(normalizedEmail)) {
        results.skipped++;
        return false;
      }
      emailsSeen.add(normalizedEmail);
      return true;
    });

    console.log(`Processing ${uniqueUsers.length} unique users (${results.skipped} duplicates skipped)`);

    for (const userData of uniqueUsers) {
      const normalizedEmail = userData.email.trim().toLowerCase();
      results.processed++;

      try {
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (existingUser) {
          // User exists - reset their password
          const existingAccount = await db.account.findFirst({
            where: {
              userId: existingUser.id,
              providerId: "credential"
            }
          });

          if (existingAccount) {
            // Update existing account password
            await db.account.update({
              where: { id: existingAccount.id },
              data: {
                password: hashedPassword,
                updatedAt: new Date()
              }
            });
          } else {
            // Create credential account if doesn't exist
            await db.account.create({
              data: {
                id: crypto.randomUUID(),
                accountId: existingUser.id,
                providerId: "credential",
                userId: existingUser.id,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
          }

          // Ensure user is accepted
          if (existingUser.acceptenceState !== "accepted") {
            await db.user.update({
              where: { id: existingUser.id },
              data: { acceptenceState: "accepted" }
            });
          }

          results.passwordReset++;
          console.log(`Password reset for: ${normalizedEmail}`);
        } else {
          // User doesn't exist - create new account
          const now = new Date();
          const userId = crypto.randomUUID();
          const accountId = crypto.randomUUID();

          // Clean phone number
          let phoneNumber: number | null = null;
          if (userData.phone) {
            const cleanPhone = userData.phone.replace(/\D/g, '');
            if (cleanPhone) {
              phoneNumber = parseInt(cleanPhone, 10);
            }
          }

          await db.$transaction(async (tx) => {
            // Create user
            await tx.user.create({
              data: {
                id: userId,
                name: userData.name.trim(),
                email: normalizedEmail,
                emailVerified: false,
                createdAt: now,
                updatedAt: now,
                role: "user",
                phone: phoneNumber,
                acceptenceState: "accepted"
              }
            });

            // Create account with password
            await tx.account.create({
              data: {
                id: accountId,
                accountId: userId,
                providerId: "credential",
                userId: userId,
                password: hashedPassword,
                createdAt: now,
                updatedAt: now
              }
            });
          });

          results.created++;
          console.log(`Created new user: ${normalizedEmail}`);
        }
      } catch (userError: any) {
        console.log(`Error processing ${normalizedEmail}:`, userError.message);
        results.errors.push({
          email: normalizedEmail,
          error: userError.message || "خطأ غير معروف"
        });
      }
    }

    console.log(`Bulk fix complete: ${results.passwordReset} reset, ${results.created} created, ${results.errors.length} errors`);

    return {
      status: "success",
      data: results,
      message: `تم معالجة ${results.processed} مستخدم: ${results.passwordReset} إعادة تعيين كلمة المرور، ${results.created} حساب جديد`
    };
  } catch (error: any) {
    console.log("ERROR [bulkFixUserAccounts]: ", error);
    return {
      status: "error",
      message: "فشل عملية إصلاح الحسابات",
      data: results
    };
  }
};

export default {
  editUserRegisteration,
  bulkEditUserRegisteration,
  getAllUsers,
  getUser,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRegion,
  getUsersByEduAdmin,
  getUsersBySchool,
  getUserWithCertificates,
  addCertificateToUser,
  backupUsersWithInvalidIds,
  restoreUsersFromBackup,
  migrateUserEntityIds,
  getUsersBackupByEmails,
  bulkFixUserAccounts
};
