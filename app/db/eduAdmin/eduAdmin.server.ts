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

const createEduAdmin =
(name: string, dbUrl?: string, regionId?: string):
Promise<StatusResponse<EduAdmin>> => {

  const db = initializeDatabase(dbUrl);
  const trimmedName = name.trim();
  const normalizedRegionId = regionId || null;

  console.log("Creating/Upserting EduAdmin:", trimmedName, "with regionId:", normalizedRegionId);

  return new Promise((resolve, reject) => {
    db.eduAdmin
      .upsert({
        where: {
          // Use the unique constraint for lookup
          name_regionId: {
            name: trimmedName,
            regionId: normalizedRegionId
          }
        },
        update: {
          // If exists, just return it (no update needed)
          updatedAt: new Date()
        },
        create: {
          name: trimmedName,
          regionId: normalizedRegionId
        }
      })
      .then((res) => {
        resolve({
          status: "success",
          data: res,
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

const updateEduAdmin = 
(id: string, data: { name: string; regionId?: string }, 
  dbUrl?: string): Promise<StatusResponse<EduAdmin>> => {

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
      .then((res) => {
        resolve({
          status: "success",
          data: res,
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

const deleteEduAdmin = 
(id: string, dbUrl?: string): 
Promise<StatusResponse<null>> => {

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

const getEduAdminsByRegion =
  (regionId: string, dbUrl?: string):
    Promise<StatusResponse<EduAdmin[]>> => {

    const db = initializeDatabase(dbUrl);

    return new Promise((resolve, reject) => {
      db.eduAdmin
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
          console.log("ERROR [getEduAdminsByRegion]: ", error);
          reject({
            status: "error",
            message: "فشل جلب الإدارات التعليمية للمنطقة",
          });
        });
    });
  };

const deleteEduAdminsWithoutRegion = 
(dbUrl?: string): Promise<StatusResponse<{ count: number }>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.eduAdmin
      .deleteMany({
        where: { 
          regionId: null 
        }
      })
      .then((result) => {
        resolve({
          status: "success",
          data: { count: result.count },
          message: `تم حذف ${result.count} إدارة تعليمية بدون منطقة بنجاح`,
        });
      })
      .catch((error: any) => {
        console.log("ERROR [deleteEduAdminsWithoutRegion]: ", error);
        reject({
          status: "error",
          message: "فشل حذف الإدارات التعليمية بدون منطقة",
        });
      });
  });
};

const deleteEduAdminsWithNonExistentRegions = 
(dbUrl?: string): Promise<StatusResponse<{ count: number }>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise(async (resolve, reject) => {
    try {
      // Use raw query to delete eduadmins where regionId doesn't exist in region table
      const result = await db.$executeRaw`
        DELETE FROM "eduAdministration" 
        WHERE "regionId" IS NOT NULL 
        AND "regionId" NOT IN (SELECT id FROM "region")
      `;

      resolve({
        status: "success",
        data: { count: result },
        message: `تم حذف ${result} إدارة تعليمية مرتبطة بمناطق غير موجودة بنجاح`,
      });
    } catch (error: any) {
      console.log("ERROR [deleteEduAdminsWithNonExistentRegions]: ", error);
      reject({
        status: "error",
        message: "فشل حذف الإدارات التعليمية المرتبطة بمناطق غير موجودة",
      });
    }
  });
};

const checkEduAdminExists = 
(name: string, regionId: string, dbUrl?: string): 
Promise<StatusResponse<{ exists: boolean; eduAdmin?: EduAdmin }>> => {

  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.eduAdmin
      .findFirst({
        where: { 
          name: name.trim(),
          regionId 
        }
      })
      .then((res) => {
        resolve({ 
          status: "success", 
          data: { 
            exists: !!res,
            eduAdmin: res || undefined
          }
        });
      })
      .catch((error: any) => {
        console.log("ERROR [checkEduAdminExists]: ", error);
        reject({
          status: "error",
          message: "فشل التحقق من وجود الإدارة التعليمية",
        });
      });
  });
};

/**
 * Remove duplicate eduAdmins, keeping the oldest one for each (name, regionId) combination.
 * This should be run before applying the unique constraint migration.
 */
const removeDuplicateEduAdmins = async (dbUrl?: string): Promise<StatusResponse<{ removed: number }>> => {
  const db = initializeDatabase(dbUrl);

  try {
    // Find all duplicate combinations
    const duplicates = await db.$queryRaw<Array<{ name: string; regionId: string | null; count: bigint }>>`
      SELECT name, "regionId", COUNT(*) as count
      FROM "eduAdministration"
      GROUP BY name, "regionId"
      HAVING COUNT(*) > 1
    `;

    let totalRemoved = 0;

    for (const dup of duplicates) {
      // Get all eduAdmins with this name and regionId, ordered by creation date
      const eduAdmins = await db.eduAdmin.findMany({
        where: {
          name: dup.name,
          regionId: dup.regionId
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Keep the first (oldest) one, delete the rest
      const toDelete = eduAdmins.slice(1).map(e => e.id);

      if (toDelete.length > 0) {
        // First, update any schools pointing to duplicates to point to the kept one
        const keptId = eduAdmins[0].id;
        await db.school.updateMany({
          where: {
            eduAdminId: { in: toDelete }
          },
          data: {
            eduAdminId: keptId
          }
        });

        await db.eduAdmin.deleteMany({
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
      message: `تم حذف ${totalRemoved} إدارة تعليمية مكررة بنجاح`
    };
  } catch (error: any) {
    console.log("ERROR [removeDuplicateEduAdmins]: ", error);
    return {
      status: "error",
      message: "فشل حذف الإدارات التعليمية المكررة",
      data: { removed: 0 }
    };
  }
};

export default {
  createEduAdmin,
  getAllEduAdmins,
  getEduAdmin,
  getEduAdminsByRegion,
  updateEduAdmin,
  deleteEduAdmin,
  deleteEduAdminsWithoutRegion,
  deleteEduAdminsWithNonExistentRegions,
  checkEduAdminExists,
  removeDuplicateEduAdmins
};