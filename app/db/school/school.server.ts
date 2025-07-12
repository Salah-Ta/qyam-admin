import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { StatusResponse, School } from "~/types/types";

const initializeDatabase = (dbUrl?: string) => {
  const db = dbUrl ? client(dbUrl) : client();
  if (!db) {
    throw new Error("فشل الاتصال بقاعدة البيانات");
  }
  return db;
};

const getAllSchools = (dbUrl?: string): Promise<StatusResponse<School[]>> => {
  
  const db = initializeDatabase(dbUrl);
  
  return new Promise((resolve, reject) => {
    db.school
      .findMany({
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

const getSchool = (id: string, dbUrl?: string): Promise<StatusResponse<School>> => {
  
  const db = initializeDatabase(dbUrl);
  
  return new Promise((resolve, reject) => {
    db.school
      .findFirstOrThrow({
        where: { id }
        // TODO: Add includes after migration
        // include: {
        //   users: true
        // }
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

const createSchool = (name: string, address: string, dbUrl?: string, eduAdminId?: string): Promise<StatusResponse<null>> => {
  
  const db = initializeDatabase(dbUrl);
  
  return new Promise((resolve, reject) => {
    db.school
      .create({
        data: { 
          name,
          address,
          eduAdminId: eduAdminId || null
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

const updateSchool = (id: string, name: string, address: string, dbUrl?: string, eduAdminId?: string): Promise<StatusResponse<null>> => {

  const db = initializeDatabase(dbUrl);
  
  return new Promise((resolve, reject) => {
    db.school
      .update({
        where: { id },
        data: { 
          name,
          address,
          eduAdminId: eduAdminId || null
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

const deleteSchool = (id: string, dbUrl?: string): Promise<StatusResponse<null>> => {
  
  const db = initializeDatabase(dbUrl);

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