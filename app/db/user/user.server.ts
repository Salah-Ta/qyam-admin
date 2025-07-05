import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { StatusResponse, QUser, AcceptenceState } from "~/types/types";

/**
 * Initialize database client with error handling
 * @param dbUrl Database URL
 * @returns Database client or null if initialization fails
 */
const initDb = (dbUrl: string) => {
  if (!dbUrl) {
    console.log("ERROR: Database URL is not provided");
    return null;
  }

  try {
    const db = client(dbUrl);
    if (!db || !db.user) {
      console.log("ERROR: Failed to initialize database client");
      return null;
    }
    return db;
  } catch (error) {
    console.log("ERROR [DB initialization]: ", error);
    return null;
  }
};
const editUserRegisteration = (userId: string, status: AcceptenceState, dbUrl: string) => {
  const db = client(dbUrl)

  return new Promise((resolve, reject) => {
    if (!db) {
      reject({ status: "error", message: "Database connection failed." });
      return;
    }
    db.user.update({
      data: { acceptenceState: status },
      where: { id: userId }
    }).then(() => {
      resolve({ status: "success", message: glossary.status_response.success[status === "accepted" ? "user_accepted" : "user_denied"] })
    }).catch((error: any) => {
      // console.log("ERROR [toggleUserRegisterationAcceptence]: ", error);
      reject({ status: "error", message: glossary.status_response.error[status === "accepted" ? "user_accepted" : "user_denied"] })
    })
  });
}

const bulkEditUserRegisteration = (userIds: string[], status: "accepted" | "denied", dbUrl: string) => {
  const db = client(dbUrl)

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
      // console.log("ERROR [toggleUserRegisterationAcceptence]: ", error);
      reject({ status: "error", message: glossary.status_response.error[status === "accepted" ? "user_accepted" : "user_denied"] })
    })
  });
}

const getAllUsers = (dbUrl: string): Promise<StatusResponse<QUser[]>> => {
  const db = client(dbUrl);
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
        // include: {
        //   userRegion: true,
        //   userEduAdmin: true,
        //   userSchool: true
        // },
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

const getUser = (id: string, dbUrl: string): Promise<StatusResponse<QUser>> => {
  const db = client(dbUrl);
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
        // include: {
        //   userRegion: true,
        //   userEduAdmin: true,
        //   userSchool: true
        // }
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
}, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = client(dbUrl);
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
}, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = client(dbUrl);
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

const deleteUser = (id: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = client(dbUrl);
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
const getUsersByRegion = (regionId: string, dbUrl: string): Promise<StatusResponse<QUser[]>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.user
      .findMany({
        where: { regionId },
        include: {
          userRegion: true,
          userEduAdmin: true,
          userSchool: true
        },
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
const getUsersByEduAdmin = (eduAdminId: string, dbUrl: string): Promise<StatusResponse<QUser[]>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.user
      .findMany({
        where: { eduAdminId },
        include: {
          userRegion: true,
          userEduAdmin: true,
          userSchool: true
        },
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
const getUsersBySchool = (schoolId: string, dbUrl: string): Promise<StatusResponse<QUser[]>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.user
      .findMany({
        where: { schoolId },
        include: {
          userRegion: true,
          userEduAdmin: true,
          userSchool: true
        },
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
const getUserWithCertificates = (userId: string, dbUrl: string): Promise<StatusResponse<any>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.reject({
      status: "error",
      message: "فشل الاتصال بقاعدة البيانات",
    });
  }

  return new Promise((resolve, reject) => {
    db.user
      .findUnique({
        where: { id: userId },
        include: {
          UserCertificate: true,
          userRegion: true,
          userEduAdmin: true,
          userSchool: true
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
          data: {
            ...user,
            region: user.userRegion?.name || "غير محدد"
          }
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

/**
 * Add certificate to user
 * @param certificateData Certificate data
 * @param dbUrl Database URL
 */
const addCertificateToUser = (
  certificateData: {
    userId: string;
    certificateKey: string;
    size: number;
    contentType: string;
    name: string;
  },
  dbUrl: string
): Promise<StatusResponse<null>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.reject({
      status: "error",
      message: "فشل الاتصال بقاعدة البيانات",
    });
  }

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