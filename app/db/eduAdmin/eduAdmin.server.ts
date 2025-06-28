import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { EduAdmin, StatusResponse } from "~/types/types";

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
    if (!db || !db.eduAdmin) {
      console.log("ERROR: Failed to initialize database client");
      return null;
    }
    return db;
  } catch (error) {
    console.log("ERROR [DB initialization]: ", error);
    return null;
  }
};

const createEduAdmin = (name: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.resolve({
      status: "error",
      message: "Failed to initialize database"
    });
  }

  return new Promise((resolve, reject) => {
    db.eduAdmin
      .create({
        data: { name }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم إضافة الإدارة التعليمية بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [createEduAdmin]: ", error);
        reject({
          status: "error",
          message: "فشل إضافة الإدارة التعليمية",
        });
      });
  });
};

const getAllEduAdmins = (dbUrl: string): Promise<StatusResponse<EduAdmin[]>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.resolve({
      status: "error",
      message: "Failed to initialize database"
    });
  }

  return new Promise((resolve, reject) => {
    db.eduAdmin
      .findMany() // No includes - remove dependency on schools
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        console.log("ERROR [getAllEduAdmins]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const getEduAdmin = (id: string, dbUrl: string): Promise<StatusResponse<EduAdmin>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.resolve({
      status: "error",
      message: "Failed to initialize database"
    });
  }

  return new Promise((resolve, reject) => {
    db.eduAdmin
      .findFirstOrThrow({
        where: { id }
        // No includes - remove dependency on schools
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        console.log("ERROR [getEduAdmin]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const updateEduAdmin = (id: string, data: { name: string }, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.resolve({
      status: "error",
      message: "Failed to initialize database"
    });
  }

  return new Promise((resolve, reject) => {
    db.eduAdmin
      .update({
        where: { id },
        data
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم تحديث الإدارة التعليمية بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [updateEduAdmin]: ", error);
        reject({
          status: "error",
          message: "فشل تحديث الإدارة التعليمية",
        });
      });
  });
};

const deleteEduAdmin = (id: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.resolve({
      status: "error",
      message: "Failed to initialize database"
    });
  }

  return new Promise((resolve, reject) => {
    db.eduAdmin
      .delete({
        where: { id }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم حذف الإدارة التعليمية بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [deleteEduAdmin]: ", error);
        reject({
          status: "error",
          message: "فشل حذف الإدارة التعليمية",
        });
      });
  });
};

export default {
  createEduAdmin,
  getAllEduAdmins,
  getEduAdmin,
  updateEduAdmin,
  deleteEduAdmin
};