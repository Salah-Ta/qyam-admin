import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import {StatusResponse,Material,Category} from "~/types/types"



const createMaterial = (material: Material, dbUrl:string):Promise<StatusResponse<any>> => {
 const db = client(dbUrl)
  return new Promise((resolve, reject) => {
    db.material.create({
        data: material,
          include: {
            category: true
          }
    }).then(()=>{
        resolve({status:"success", message:glossary.status_response.success.material_added})

    }).catch((error:any)=>{
        reject({status:"error", message:glossary.status_response.error.material_added})

    })
  });
};

const getAllMaterials = (dbUrl:string):Promise<StatusResponse<Material>> => {
    const db = client(dbUrl)
    return new Promise((resolve, reject) => {
        db.material.findMany().then((res)=>{
            resolve({status:"success", data:res})
        }).catch((error:any)=>{
            // console.log("ERROR [getAllMaterials]: ", error);
            reject({status:"error", message:glossary.status_response.error.general})
    
        })
      });

};

const getMaterial = (id:number, dbUrl:string) => {
    const db = client(dbUrl)
    return new Promise((resolve, reject) => {
        db.material.findFirstOrThrow().then((res)=>{
            resolve({status:"success", data:res})
        }).catch((error:any)=>{
            // console.log("ERROR [getMaterial]: ", error);
            reject({status:"error", message:glossary.status_response.error.general})
        })
      });

    
};

//We can update the file or the category of a single material
const updateMaterial = (material:Material,dbUrl:string ) => {
    const db = client(dbUrl)

    return new Promise((resolve, reject) => {
        db.material.update({
            data: material,
            where: {id:material.id}
        }).then(()=>{
            resolve({status:"success", message:glossary.status_response.success.material_updated})
        }).catch((error:any)=>{
            // console.log("ERROR [updateMaterial]: ", error);
            reject({status:"error", message:glossary.status_response.error.material_updated})
    
        })
      });


};
const deleteMaterial = (materialId:string,dbUrl:string) => {
    const db = client(dbUrl)

    return new Promise((resolve, reject) => {
        db.material.delete({
            where: {id:materialId}
        }).then(()=>{
            resolve({status:"success", message:glossary.status_response.success.material_deleted})
        }).catch((error:any)=>{
            // console.log("ERROR [ deleteMaterial]: ", error);
            reject({status:"error", message:glossary.status_response.error.material_deleted})
    
        })
      });

};



const getAllCategoriesWithLinkedMaterials = (dbUrl:string)=>{
    const db = client(dbUrl)

    return new Promise((resolve, reject) => {
        db.category.findMany({
            include:{
                Material:{

                }
            }
        }).then((res)=>{
            resolve({status:"success",data:res, message:glossary.status_response.success.material_deleted})
        }).catch((error:any)=>{
            // console.log("ERROR [ deleteMaterial]: ", error);
            reject({status:"error", message:glossary.status_response.error.material_deleted})
    
        })
      });

}


export default {
    createMaterial,
    getAllMaterials,
    getMaterial,
    updateMaterial,
    deleteMaterial,
    getAllCategoriesWithLinkedMaterials
}