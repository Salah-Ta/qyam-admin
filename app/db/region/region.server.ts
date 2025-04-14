import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { StatusResponse, Region } from "~/types/types";

const getAllRegions = (dbUrl: string): Promise<StatusResponse<Region[]>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.region
      .findMany({
        orderBy: {
          name: 'asc'
        }
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        console.log("ERROR [getAllRegions]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const getRegion = (id: string, dbUrl: string): Promise<StatusResponse<Region>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.region
      .findFirstOrThrow({
        where: { id }
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        console.log("ERROR [getRegion]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const createRegion = (name: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.region
      .create({
        data: { name }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم إضافة المنطقة بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [createRegion]: ", error);
        reject({
          status: "error",
          message: "فشل إضافة المنطقة",
        });
      });
  });
};

const updateRegion = (id: string, name: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.region
      .update({
        where: { id },
        data: { name }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم تحديث المنطقة بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [updateRegion]: ", error);
        reject({
          status: "error",
          message: "فشل تحديث المنطقة",
        });
      });
  });
};

const deleteRegion = (id: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.region
      .delete({
        where: { id }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم حذف المنطقة بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [deleteRegion]: ", error);
        reject({
          status: "error",
          message: "فشل حذف المنطقة",
        });
      });
  });
};

export default {
  getAllRegions,
  getRegion,
  createRegion,
  updateRegion,
  deleteRegion
};