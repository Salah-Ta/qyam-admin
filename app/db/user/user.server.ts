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

const editUserRegisteration = (userId: string, status: AcceptenceState, dbUrl?: string, emailConfig?: {
  resendApi: string;
  mainEmail: string;
  userEmail: string;
},
  previousStatus?: AcceptenceState) => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.user.update({
      data: { acceptenceState: status },
      where: { id: userId }
    }).then(async () => {
      // Send email notification if status is accepted or denied
      if ((status === "accepted" || status === "denied" || status === "pending" || status === "idle") && emailConfig) {

        let emailText;
        switch (status) {
          case "accepted":
            emailText = previousStatus === "idle" ? glossary.email.reactivation_message : glossary.email.acceptance_message;
            break;
          case "denied":
            emailText = glossary.email.rejection_message;
            break;
          case "pending":
            emailText = glossary.email.registration_message;
            break;
          case "idle":
            emailText = glossary.email.suspension_message;
            break;
        }
        // Send email
        await sendEmail({
          to: emailConfig!.userEmail,
          subject: glossary.email.program_status_subject,
          template: "program-status",
          props: { status, name: "" },
          text: emailText,
        },
          emailConfig!.resendApi,
          emailConfig!.mainEmail);

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

const createUser = (userData: {
  name: string,
  email: string,
  password: string,
  phone?: string,
  role: string,
  regionId?: string,
  eduAdminId?: string,
  schoolId?: string
}, dbUrl?: string): Promise<StatusResponse<null>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.user
      .create({
        data: userData
      })
      .then(() => {
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

  return new Promise((resolve, reject) => {
    db.user
      .delete({
        where: { id }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم حذف المستخدم بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [deleteUser]: ", error);
        reject({
          status: "error",
          message: "فشل حذف المستخدم",
        });
      });
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
  createUser,
  updateUser,
  deleteUser,
  getUsersByRegion,
  getUsersByEduAdmin,
  getUsersBySchool,
  getUserWithCertificates,
  addCertificateToUser
};