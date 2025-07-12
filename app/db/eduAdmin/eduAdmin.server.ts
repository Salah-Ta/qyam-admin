import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { EduAdmin, StatusResponse } from "~/types/types";

const initializeDatabase = (dbUrl?: string) => {
  const db = dbUrl ? client(dbUrl) : client();
  if (!db) {
    throw new Error("فشل الاتصال بقاعدة البيانات");
  }
  return db;
};

const createEduAdmin = (name: string, dbUrl?: string, regionId?: string): Promise<StatusResponse<null>> => {
  
  const db = initializeDatabase(dbUrl);

  console.log("Creating EduAdmin:", name, "with regionId:", regionId);

  console.log("Creating EduAdmin:", name, "with regionId:", regionId);

  return new Promise((resolve, reject) => {
    db.eduAdmin
      .create({
        data: { 
          name,
          // Temporarily commented out until migration is complete
          regionId: regionId || null
        }
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

const getAllEduAdmins = (dbUrl?: string): Promise<StatusResponse<EduAdmin[]>> => {
  
  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.eduAdmin
      .findMany()
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

const getEduAdmin = (id: string, dbUrl?: string): Promise<StatusResponse<EduAdmin>> => {
  
  const db = initializeDatabase(dbUrl);
  
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

const updateEduAdmin = (id: string, data: { name: string; regionId?: string }, dbUrl?: string): Promise<StatusResponse<null>> => {
  
  const db = initializeDatabase(dbUrl);
  
  return new Promise((resolve, reject) => {
    db.eduAdmin
      .update({
        where: { id },
        data: {
          name: data.name,
          regionId: data.regionId || null
        }
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

const deleteEduAdmin = (id: string, dbUrl?: string): Promise<StatusResponse<null>> => {

  const db = initializeDatabase(dbUrl);

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