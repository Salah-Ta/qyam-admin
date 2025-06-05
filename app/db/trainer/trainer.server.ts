import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { StatusResponse, QUser } from "~/types/types";

/**
 * Get all trainers (users with role "USER" who are not admins or supervisors)
 * @param dbUrl - Database URL
 * @param currentUser - The currently logged in user
 */
const getAllTrainers = (dbUrl: string, currentUser: QUser | null): Promise<StatusResponse<QUser[]>> => {
  // Check if user is authenticated and is an admin
  if (!currentUser) {
    return Promise.resolve({ 
      status: "error", 
      message: "Unauthorized access", 
      code: 401 
    });
  }
  
  if (currentUser.role !== "ADMIN") {
    return Promise.resolve({ 
      status: "error", 
      message: "Only admins can access trainer list", 
      code: 403 
    });
  }

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
        console.log("ERROR [getAllTrainers]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

/**
 * Get a specific trainer by ID
 */
const getTrainerById = (trainerId: string, dbUrl: string): Promise<StatusResponse<QUser>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.user
      .findFirstOrThrow({
        where: { 
          id: trainerId,
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
        console.log("ERROR [getTrainerById]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

/**
 * Get trainers by school ID
 */
const getTrainersBySchool = (schoolId: string, dbUrl: string): Promise<StatusResponse<QUser[]>> => {
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
        console.log("ERROR [getTrainersBySchool]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

/**
 * Update trainer's profile information
 */
const updateTrainerProfile = (
  trainerId: string, 
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
          id: trainerId,
          role: "USER"
        },
        data: profileData
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم تحديث بيانات المدرب بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [updateTrainerProfile]: ", error);
        reject({
          status: "error",
          message: "فشل تحديث بيانات المدرب",
        });
      });
  });
};

export default {
  getAllTrainers,
  getTrainerById,
  getTrainersBySchool,
  updateTrainerProfile
};