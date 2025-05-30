import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { StatusResponse, QUser } from "~/types/types";

/**
 * Get all teachers (users with role "USER" who are not admins or supervisors)
 */
const getAllTeachers = (dbUrl: string): Promise<StatusResponse<QUser[]>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.user
      .findMany({
        where: { 
          role: "USER",
          acceptenceState: "accepted" 
        },
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
        console.log("ERROR [getAllTeachers]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

/**
 * Get a specific teacher by ID
 */
const getTeacherById = (teacherId: string, dbUrl: string): Promise<StatusResponse<QUser>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.user
      .findFirstOrThrow({
        where: { 
          id: teacherId,
          role: "USER" 
        },
        include: {
          userRegion: true,
          userEduAdmin: true,
          userSchool: true
        }
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        console.log("ERROR [getTeacherById]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

/**
 * Get teachers by school ID
 */
const getTeachersBySchool = (schoolId: string, dbUrl: string): Promise<StatusResponse<QUser[]>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.user
      .findMany({
        where: { 
          schoolId,
          role: "USER" 
        },
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
        console.log("ERROR [getTeachersBySchool]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

/**
 * Update teacher's profile information
 */
const updateTeacherProfile = (
  teacherId: string, 
  profileData: {
    name?: string,
    email?: string,
    phone?: string,
    trainingHours?: number,
    noStudents?: number,
    schoolId?: string | null
  },
  dbUrl: string
): Promise<StatusResponse<null>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.user
      .update({
        where: { 
          id: teacherId,
          role: "USER"
        },
        data: profileData
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم تحديث بيانات المدرس بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [updateTeacherProfile]: ", error);
        reject({
          status: "error",
          message: "فشل تحديث بيانات المدرس",
        });
      });
  });
};

export default {
  getAllTeachers,
  getTeacherById,
  getTeachersBySchool,
  updateTeacherProfile
};