import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { Program, StatusResponse } from "~/types/types";

const createProgram = (
  program: Program,
  dbUrl: string
): Promise<StatusResponse<any>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.program
      .create({
        data: program,
      })
      .then(() => {
        resolve({
          status: "success",
          message: glossary.status_response.success.material_added,
        });
      })
      .catch((error: any) => {
        // console.log("ERROR [createMaterial]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.material_added,
        });
      });
  });
};

const getAllPrograms = (dbUrl: string): Promise<StatusResponse<Program>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.program
      .findMany()
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        // console.log("ERROR [getAllPrograms]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const getProgram = (id: string, dbUrl: string) => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.program
      .findFirstOrThrow({
        where: { id: id },
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        console.log("ERROR [getProgram]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};


const updateProgram = (program: Program, dbUrl: string) => {
  const db = client(dbUrl);

  return new Promise((resolve, reject) => {
    db.program
      .update({
        data: program,
        where: { id: program.id },
      })
      .then(() => {
        resolve({
          status: "success",
          message: glossary.status_response.success.material_updated,
        });
      })
      .catch((error: any) => {
        // console.log("ERROR [updateProgram]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.material_updated,
        });
      });
  });
};
const deleteProgram = (programId: string, dbUrl: string) => {
  const db = client(dbUrl);

  return new Promise((resolve, reject) => {
    db.program
      .delete({
        where: { id: programId },
      })
      .then(() => {
        resolve({
          status: "success",
          message: glossary.status_response.success.material_deleted,
        });
      })
      .catch((error: any) => {
        // console.log("ERROR [ deleteMaterial]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.material_deleted,
        });
      });
  });
};


export default {
    createProgram,
    updateProgram, 
    getAllPrograms,
    getProgram, 
    deleteProgram
};
