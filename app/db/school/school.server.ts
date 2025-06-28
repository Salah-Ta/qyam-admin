import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { StatusResponse, School } from "~/types/types";

/**
 * Initialize database client with error handling
 */
const initDb = (dbUrl: string) => {
  if (!dbUrl) {
    console.log("ERROR: Database URL is not provided");
    return null;
  }

  try {
    const db = client(dbUrl);
    if (!db || !db.school) {
      console.log("ERROR: Failed to initialize database client");
      return null;
    }
    return db;
  } catch (error) {
    console.log("ERROR [DB initialization]: ", error);
    return null;
  }
};

const getAllSchools = (dbUrl: string): Promise<StatusResponse<School[]>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.resolve({
      status: "error",
      message: "Failed to initialize database"
    });
  }
  
  return new Promise((resolve, reject) => {
    db.school
      .findMany({
        // Remove eduAdmin and region includes
        orderBy: {
          name: 'asc'
        }
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        console.log("ERROR [getAllSchools]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const getSchool = (id: string, dbUrl: string): Promise<StatusResponse<School>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.resolve({
      status: "error",
      message: "Failed to initialize database"
    });
  }
  
  return new Promise((resolve, reject) => {
    db.school
      .findFirstOrThrow({
        where: { id },
        include: {
          // Remove eduAdmin and region includes
          users: true
        }
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        console.log("ERROR [getSchool]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const createSchool = (name: string, address: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.resolve({
      status: "error",
      message: "Failed to initialize database"
    });
  }
  
  return new Promise((resolve, reject) => {
    db.school
      .create({
        data: { 
          name,
          address
          // Remove eduAdminId
        }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم إضافة المدرسة بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [createSchool]: ", error);
        reject({
          status: "error",
          message: "فشل إضافة المدرسة",
        });
      });
  });
};

const updateSchool = (id: string, name: string, address: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.resolve({
      status: "error",
      message: "Failed to initialize database"
    });
  }
  
  return new Promise((resolve, reject) => {
    db.school
      .update({
        where: { id },
        data: { 
          name,
          address
          // Remove eduAdminId
        }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم تحديث المدرسة بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [updateSchool]: ", error);
        reject({
          status: "error",
          message: "فشل تحديث المدرسة",
        });
      });
  });
};

const deleteSchool = (id: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = initDb(dbUrl);
  if (!db) {
    return Promise.resolve({
      status: "error",
      message: "Failed to initialize database"
    });
  }
  
  return new Promise((resolve, reject) => {
    db.school
      .delete({
        where: { id }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم حذف المدرسة بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [deleteSchool]: ", error);
        reject({
          status: "error",
          message: "فشل حذف المدرسة",
        });
      });
  });
};

export default {
  getAllSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool
};