import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { StatusResponse, QUser } from "~/types/types";

/**
 * Normalize role string to match standard values (case-insensitive)
 */
const normalizeRole = (role: string): string => {
  const upperRole = role.toUpperCase();
  
  switch (upperRole) {
    case 'ADMIN':
      return "ADMIN";
    case 'SUPERVISOR':
      return "SUPERVISOR";
    case 'USER':
      return "USER";
    default:
      return "USER"; // Default to USER if not recognized
  }
};

/**
 * Get all available roles
 */
const getAllRoles = (): string[] => {
  return ["ADMIN", "SUPERVISOR", "USER"];
};

/**
 * Update a user's role
 */
const updateUserRole = (userId: string, role: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = client(dbUrl);
  const normalizedRole = normalizeRole(role);
  
  return new Promise((resolve, reject) => {
    db.user
      .update({
        where: { id: userId },
        data: { role: normalizedRole }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم تحديث دور المستخدم بنجاح"
        });
      })
      .catch((error: any) => {
        console.log("ERROR [updateUserRole]: ", error);
        reject({
          status: "error",
          message: "فشل تحديث دور المستخدم"
        });
      });
  });
};

/**
 * Get users by role
 */
const getUsersByRole = (role: string, dbUrl: string): Promise<StatusResponse<QUser[]>> => {
  const db = client(dbUrl);
  const normalizedRole = normalizeRole(role);
  
  return new Promise((resolve, reject) => {
    db.user
      .findMany({
        where: { role: normalizedRole },
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
        console.log("ERROR [getUsersByRole]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general
        });
      });
  });
};

/**
 * Bulk update user roles
 */
const bulkUpdateUserRoles = (userIds: string[], role: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = client(dbUrl);
  const normalizedRole = normalizeRole(role);
  
  return new Promise((resolve, reject) => {
    db.user
      .updateMany({
        where: { id: { in: userIds } },
        data: { role: normalizedRole }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم تحديث أدوار المستخدمين بنجاح"
        });
      })
      .catch((error: any) => {
        console.log("ERROR [bulkUpdateUserRoles]: ", error);
        reject({
          status: "error",
          message: "فشل تحديث أدوار المستخدمين"
        });
      });
  });
};

/**
 * Check if a role is admin (case-insensitive)
 */
const isAdmin = (role: string): boolean => {
  return normalizeRole(role) === "ADMIN";
};

/**
 * Check if a role is supervisor (case-insensitive)
 */
const isSupervisor = (role: string): boolean => {
  return normalizeRole(role) === "SUPERVISOR";
};

/**
 * Check if a role has elevated permissions (admin or supervisor)
 */
const hasElevatedPermissions = (role: string): boolean => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "ADMIN" || normalizedRole === "SUPERVISOR";
};

/**
 * Get display name for a role
 */
const getRoleDisplayName = (role: string): string => {
  const normalizedRole = normalizeRole(role);
  
  switch (normalizedRole) {
    case "ADMIN":
      return "مدير النظام";
    case "SUPERVISOR":
      return "مشرف";
    case "USER":
      return "مستخدم عادي";
    default:
      return "غير معروف";
  }
};

export default {
  getAllRoles,
  updateUserRole,
  getUsersByRole,
  bulkUpdateUserRoles,
  isAdmin,
  isSupervisor,
  hasElevatedPermissions,
  getRoleDisplayName,
  normalizeRole
};