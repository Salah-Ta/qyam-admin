import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { StatusResponse, QUser, AcceptenceState } from "~/types/types";
import { sendEmail } from "~/lib/send-email.server";

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

const editUserRegisteration = 
(userId: string, status: AcceptenceState, 
  dbUrl?: string, emailConfig?: {
  resendApi: string;
  mainEmail: string;
  userEmail: string;
}) => {

  const db = initializeDatabase(dbUrl);
  // Check if emailConfig is provided, if not, set it to an empty object
    emailConfig = emailConfig || {
      resendApi: process.env.RESEND_API || "",
      mainEmail: process.env.MAIN_EMAIL || "",
      userEmail: "" // This will be set later if not provided
    };

    // Get the user email from the database if not provided
    if (!emailConfig?.userEmail) {
      db.user.findUnique({
        where: { id: userId },
        select: { email: true }
      }).then(user => {
        if (user) {
          emailConfig = {
            resendApi: emailConfig?.resendApi || "",
            mainEmail: emailConfig?.mainEmail || "",
            userEmail: user.email
          };
        }
      }).catch(error => {
        console.error("Error fetching user email:", error);
      });
    }

  return new Promise((resolve, reject) => {
    if (!db) {
      reject({ status: "error", message: "Database connection failed." });
      return;
    }
    // First fetch the user to get their details for the email
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    }).then(async (user) => {
      if (!user) {
        throw new Error("User not found");
      }
      
      // Update user email in emailConfig if not provided
      if (!emailConfig?.userEmail) {
        emailConfig = {
          ...emailConfig,
          userEmail: user.email
        };
      }
      
      // Update the user status
      return db.user.update({
        data: { acceptenceState: status },
        where: { id: userId }
      });
    }).then(async (updatedUser) => {
      // Get the user details for email
      const userForEmail = await db.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      });
      // Send email notification based on status
        if (status && emailConfig && userForEmail) {
          // Console log the emailConfig & userEmail & status for debugging
          console.log("Email Config:", emailConfig);
          console.log("User Email:", emailConfig.userEmail);
          console.log("Status:", status);
          
          // Send different emails based on status
          if (status === "idle") {
            // Send account deactivation email
            await sendEmail({
              to: emailConfig!.userEmail,
              subject: glossary.email.account_deactivation_subject,
              template: "account-deactivation",
              props: { 
                username: userForEmail.name || "المستخدم",
                contactUrl: "/contact" 
              },
              text: '',
            },
              emailConfig!.resendApi,
              emailConfig!.mainEmail);
          } else {
            // Send program status email for accepted/denied
            await sendEmail({
              to: emailConfig!.userEmail,
              subject: glossary.email.program_status_subject,
              template: "program-status",
              props: { status, name: userForEmail.name || "" },
              text: '',
            },
              emailConfig!.resendApi,
              emailConfig!.mainEmail);
          }

          console.log("✅ Email sent successfully");
        }
    }).then(() => {
      resolve({ status: "success", message: glossary.status_response.success[status === "accepted" ? "user_accepted" : "user_denied"] })
    }).catch((error: any) => {
      console.log("ERROR [editUserRegisteration]: ", error);
      reject({ status: "error", message: glossary.status_response.error[status === "accepted" ? "user_accepted" : "user_denied"] })
    })
  });
}

const bulkEditUserRegisteration = (userIds: string[], status: "accepted" | "denied", dbUrl?: string) => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    if (!db) {
      reject({ status: "error", message: "Database connection failed." });
      return;
    }
    db.user.updateMany({
      data: { acceptenceState: status },
      where: { id: { in: userIds } }
    }).then(() => {
      resolve({ status: "success", message: glossary.status_response.success[status === "accepted" ? "user_accepted" : "user_denied"] })
    }).catch((error: any) => {
      console.log("ERROR [bulkEditUserRegisteration]: ", error);
      reject({ status: "error", message: glossary.status_response.error[status === "accepted" ? "user_accepted" : "user_denied"] })
    })
  });
}

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
        console.log("ERROR [getAllUsers]: ", error);
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
        console.log("ERROR [getUser]: ", error);
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
        console.log("ERROR [getUserByEmail]: ", error);
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
  schoolId?: string
}, dbUrl?: string, emailConfig?: { resendApi: string, mainEmail: string }): Promise<StatusResponse<null>> => {

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
      .create({
        data: userData
      })
      .then(async () => {
        // Send email notification if email is provided
        if (userData.email) {
          // Check if emailConfig is provided, if not, set it to an empty object
          emailConfig = emailConfig || {
            resendApi: process.env.RESEND_API || "",
            mainEmail: process.env.MAIN_EMAIL || "",
          };
          await sendEmail({
            to: userData.email,
            subject: glossary.email.program_status_subject,
            template: "user-registration",
            props: { name: userData.name },
            text: '',
          }, emailConfig.resendApi, emailConfig.mainEmail);
        }
        resolve({
          status: "success",
          message: "تم إنشاء المستخدم بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [createUser]: ", error);
        reject({
          status: "error",
          message: "فشل إنشاء المستخدم",
        });
      });
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

  return new Promise((resolve, reject) => {
    db.user
      .update({
        where: { id },
        data: userData
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم تحديث المستخدم بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [updateUser]: ", error);
        reject({
          status: "error",
          message: "فشل تحديث المستخدم",
        });
      });
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

      console.log("Deleting user with ID:", id, "and email:", user.email);
      console.log("User regionId:", user.regionId);
      console.log("User eduAdminId:", user.eduAdminId);
      console.log("User schoolId:", user.schoolId);

      // First, let's check if the referenced entities exist
      if (user.regionId) {
        try {
          const region = await db.region.findUnique({ where: { id: user.regionId } });
          console.log("Region exists:", !!region);
        } catch (error) {
          console.log("Error checking region:", error);
        }
      }

      if (user.eduAdminId) {
        try {
          const eduAdmin = await db.eduAdmin.findUnique({ where: { id: user.eduAdminId } });
          console.log("EduAdmin exists:", !!eduAdmin);
        } catch (error) {
          console.log("Error checking eduAdmin:", error);
        }
      }

      if (user.schoolId) {
        try {
          const school = await db.school.findUnique({ where: { id: user.schoolId } });
          console.log("School exists:", !!school);
        } catch (error) {
          console.log("Error checking school:", error);
        }
      }

      // Use a transaction to ensure all deletions succeed or fail together
      await db.$transaction(async (tx) => {
        // Delete related records first to avoid foreign key constraint errors
        
        console.log("Step 1a: Getting user reports to delete related records...");
        const userReports = await tx.report.findMany({
          where: { userId: id },
          select: { id: true }
        });
        const reportIds = userReports.map(report => report.id);
        console.log(`Found ${reportIds.length} reports to delete`);

        if (reportIds.length > 0) {
          console.log("Step 1b: Deleting skill reports...");
          const skillReportDeleteResult = await tx.skillReport.deleteMany({
            where: { reportId: { in: reportIds } }
          });
          console.log(`Deleted ${skillReportDeleteResult.count} skill reports`);

          console.log("Step 1c: Deleting testimonial reports...");
          const testimonialReportDeleteResult = await tx.testimonialReport.deleteMany({
            where: { reportId: { in: reportIds } }
          });
          console.log(`Deleted ${testimonialReportDeleteResult.count} testimonial reports`);
        }

        console.log("Step 1d: Deleting user reports...");
        const reportDeleteResult = await tx.report.deleteMany({
          where: { userId: id }
        });
        console.log(`Deleted ${reportDeleteResult.count} reports`);
        
        console.log("Step 2: Deleting messages sent by user...");
        const sentMessagesResult = await tx.message.deleteMany({
          where: { fromUserId: id }
        });
        console.log(`Deleted ${sentMessagesResult.count} sent messages`);
        
        console.log("Step 3: Deleting messages received by user...");
        const receivedMessagesResult = await tx.message.deleteMany({
          where: { toUserId: id }
        });
        console.log(`Deleted ${receivedMessagesResult.count} received messages`);

        console.log("Step 4: Deleting verification records...");
        const verificationResult = await tx.verification.deleteMany({
          where: { identifier: user.email }
        });
        console.log(`Deleted ${verificationResult.count} verification records`);
        
        console.log("Step 5: Clearing foreign key references...");
        // Clear any foreign key references that might cause issues
        await tx.user.update({
          where: { id },
          data: {
            regionId: null,
            eduAdminId: null,
            schoolId: null
          }
        });
        console.log("Cleared foreign key references");
        
        console.log("Step 6: Checking and deleting sessions and accounts...");
        // Check how many sessions and accounts exist for this user
        const sessionsCount = await tx.session.count({ where: { userId: id } });
        const accountsCount = await tx.account.count({ where: { userId: id } });
        console.log(`Found ${sessionsCount} sessions and ${accountsCount} accounts for user`);

        // Explicitly delete sessions and accounts (even though they should cascade)
        if (sessionsCount > 0) {
          const deletedSessions = await tx.session.deleteMany({ where: { userId: id } });
          console.log(`Explicitly deleted ${deletedSessions.count} sessions`);
        }
        
        if (accountsCount > 0) {
          const deletedAccounts = await tx.account.deleteMany({ where: { userId: id } });
          console.log(`Explicitly deleted ${deletedAccounts.count} accounts`);
        }

        console.log("Step 7: Attempting to delete user account...");
        try {
          // Finally delete the user (remaining cascades: certificates)
          await tx.user.delete({
            where: { id }
          });
          console.log("User successfully deleted");
        } catch (deleteError: any) {
          console.error("Error during user deletion:", deleteError);
          console.error("Delete error code:", deleteError.code);
          console.error("Delete error message:", deleteError.message);
          throw deleteError; // Re-throw to trigger transaction rollback
        }
      });

      console.log("Successfully deleted user with email:", user.email);
      
      // Verify deletion by trying to find the user
      try {
        const deletedUser = await db.user.findUnique({ where: { id } });
        if (deletedUser) {
          console.error("WARNING: User still exists in database after deletion!");
          reject({
            status: "error",
            message: "فشل في حذف المستخدم - لا يزال موجوداً في قاعدة البيانات",
          });
          return;
        } else {
          console.log("✅ Confirmed: User has been completely removed from database");
        }
      } catch (verifyError) {
        console.log("✅ User verification failed as expected - user was deleted");
      }
      
      resolve({
        status: "success",
        message: "تم حذف المستخدم بنجاح",
      });
    } catch (error: any) {
      console.log("ERROR [deleteUser]: ", error);
      console.log("Error code:", error.code);
      console.log("Error message:", error.message);
      
      // Provide more specific error messages based on the error type
      let errorMessage = "فشل حذف المستخدم";
      
      if (error.code === 'P2003') {
        errorMessage = "لا يمكن حذف المستخدم بسبب وجود بيانات مرتبطة به";
        console.log("Foreign key constraint error - user has related data");
      } else if (error.code === 'P2025') {
        errorMessage = "المستخدم غير موجود";
        console.log("User not found error");
      } else if (error.message && error.message.includes('timeout')) {
        errorMessage = "انتهت مهلة العملية. الرجاء المحاولة مرة أخرى";
        console.log("Timeout error");
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
        console.log("ERROR [getUsersByRegion]: ", error);
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
        console.log("ERROR [getUsersByEduAdmin]: ", error);
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
        console.log("ERROR [getUsersBySchool]: ", error);
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
        console.log("ERROR [getUserWithCertificates]: ", error);
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
        console.log("ERROR [addCertificateToUser]: ", error);
        reject({
          status: "error",
          message: "فشل إضافة الشهادة للمستخدم",
        });
      });
  });
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
  addCertificateToUser
};