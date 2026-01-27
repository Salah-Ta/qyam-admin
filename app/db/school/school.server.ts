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

const getAllSchools = (dbUrl?: string): 
Promise<StatusResponse<School[]>> => {
  
  const db = initializeDatabase(dbUrl);
  
  return new Promise((resolve, reject) => {
    db.school
      .findMany({
        include: {
          eduAdmin: {
            select: {
              id: true,
              name: true,
              regionId: true,
            }
          }
        },
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

const getSchool = 
(id: string, dbUrl?: string): 
Promise<StatusResponse<School>> => {
  
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

const createSchool =
(name: string, address: string, dbUrl?: string, eduAdminId?: string):
Promise<StatusResponse<School>> => {

  const db = initializeDatabase(dbUrl);
  const trimmedName = name.trim();
  const normalizedEduAdminId = eduAdminId || null;

  return new Promise((resolve, reject) => {
    db.school
      .upsert({
        where: {
          // Use the unique constraint for lookup
          name_eduAdminId: {
            name: trimmedName,
            eduAdminId: normalizedEduAdminId
          }
        },
        update: {
          // If exists, update the address
          address
        },
        create: {
          name: trimmedName,
          address,
          eduAdminId: normalizedEduAdminId
        }
      })
      .then((res) => {
        resolve({
          status: "success",
          data: res,
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

const updateSchool = 
(id: string, name: string, address: string, dbUrl?: string, eduAdminId?: string): 
Promise<StatusResponse<School>> => {

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
      .then((res) => {
        resolve({
          status: "success",
          data: res,
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

const deleteSchool = 
(id: string, dbUrl?: string): 
Promise<StatusResponse<null>> => {
  
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

const getSchoolsByEduAdmin = 
(eduAdminId: string, dbUrl?: string): 
Promise<StatusResponse<School[]>> => {
  
  const db = initializeDatabase(dbUrl);
  
  return new Promise((resolve, reject) => {
    db.school
      .findMany({
        where: { eduAdminId },
        include: {
          eduAdmin: {
            select: {
              id: true,
              name: true,
              regionId: true,
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        console.log("ERROR [getSchoolsByEduAdmin]: ", error);
        reject({
          status: "error",
          message: "فشل جلب المدارس للإدارة التعليمية",
        });
      });
  });
};

const checkSchoolExists = 
(name: string, eduAdminId: string, dbUrl?: string): 
Promise<StatusResponse<{ exists: boolean; school?: School }>> => {
  
  const db = initializeDatabase(dbUrl);
  
  return new Promise((resolve, reject) => {
    db.school
      .findFirst({
        where: { 
          name: name.trim(),
          eduAdminId 
        }
      })
      .then((res) => {
        resolve({ 
          status: "success", 
          data: { 
            exists: !!res,
            school: res || undefined
          }
        });
      })
      .catch((error: any) => {
        console.log("ERROR [checkSchoolExists]: ", error);
        reject({
          status: "error",
          message: "فشل التحقق من وجود المدرسة",
        });
      });
  });
};

/**
 * Remove duplicate schools, keeping the oldest one for each (name, eduAdminId) combination.
 * This should be run before applying the unique constraint migration.
 */
const removeDuplicateSchools = async (dbUrl?: string): Promise<StatusResponse<{ removed: number }>> => {
  const db = initializeDatabase(dbUrl);

  try {
    // Find all duplicate combinations
    const duplicates = await db.$queryRaw<Array<{ name: string; eduAdminId: string | null; count: bigint }>>`
      SELECT name, "eduAdminId", COUNT(*) as count
      FROM school
      GROUP BY name, "eduAdminId"
      HAVING COUNT(*) > 1
    `;

    let totalRemoved = 0;

    for (const dup of duplicates) {
      // Get all schools with this name and eduAdminId, ordered by creation date
      const schools = await db.school.findMany({
        where: {
          name: dup.name,
          eduAdminId: dup.eduAdminId
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Keep the first (oldest) one, delete the rest
      const toDelete = schools.slice(1).map(s => s.id);

      if (toDelete.length > 0) {
        await db.school.deleteMany({
          where: {
            id: { in: toDelete }
          }
        });
        totalRemoved += toDelete.length;
      }
    }

    return {
      status: "success",
      data: { removed: totalRemoved },
      message: `تم حذف ${totalRemoved} مدرسة مكررة بنجاح`
    };
  } catch (error: any) {
    console.log("ERROR [removeDuplicateSchools]: ", error);
    return {
      status: "error",
      message: "فشل حذف المدارس المكررة",
      data: { removed: 0 }
    };
  }
};

export default {
  getAllSchools,
  getSchool,
  getSchoolsByEduAdmin,
  createSchool,
  updateSchool,
  deleteSchool,
  checkSchoolExists,
  removeDuplicateSchools
};