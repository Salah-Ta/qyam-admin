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

const editUserRegisteration = (userId: string, status: AcceptenceState, dbUrl?: string, emailConfig?: {
  resendApi: string;
  mainEmail: string;
  userEmail: string;
},
previousStatus?: AcceptenceState) => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    if (!db) {
      reject({ status: "error", message: "Database connection failed." });
      return;
    }
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
      .then((res) => {
        resolve({ status: "success", data: res });
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

const getUser = (id: string, dbUrl?: string): Promise<StatusResponse<QUser>> => {

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
      .then((res) => {
        resolve({ status: "success", data: res });
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