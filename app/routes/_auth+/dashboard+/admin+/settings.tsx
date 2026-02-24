import React, { useEffect, useState } from "react";
import UserIcon from "../../../../assets/icons/user-modified.svg";
import { data } from "@remix-run/cloudflare";
import {
  useLoaderData,
  useActionData,
  Form,
  useRevalidator,
} from "@remix-run/react";
import schoolDB from "~/db/school/school.server";
import eduAdminDB from "~/db/eduAdmin/eduAdmin.server";
import regionDB from "~/db/region/region.server";
import userDB from "~/db/user/user.server";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

// --- Loader & Action ---
export async function loader({ context }: LoaderFunctionArgs) {
  const dbUrl = context.cloudflare.env.DATABASE_URL;

  try {
    // Add timeout to prevent worker from hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database operation timeout")), 15000)
    );

    const dataPromise = Promise.all([
      regionDB.getAllRegions(dbUrl),
      eduAdminDB.getAllEduAdmins(dbUrl),
      schoolDB.getAllSchools(dbUrl),
    ]);

    const [regions, eduAdmins, schools] = (await Promise.race([
      dataPromise,
      timeoutPromise,
    ])) as any[];

    return data({
      regions: regions.data || [],
      eduAdmins: eduAdmins.data || [],
      schools: schools.data || [],
    });
  } catch (error) {
    return data({
      regions: [],
      eduAdmins: [],
      schools: [],
    });
  }
}

export const action = async ({ request, context }: LoaderFunctionArgs) => {
  const requestTimestamp = Date.now();
  
  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const entityType = formData.get("entityType");
  const entityId = formData.get("entityId");
  const names = formData.getAll("itemName");
  const parentId = formData.get("parentId");
  const submissionId = formData.get("submissionId");
  

  try {
    // Handle delete action
    if (actionType === "delete" && entityId) {
      let result;
      switch (entityType) {
        case "region":
          result = await regionDB.deleteRegion(entityId as string, dbUrl);
          break;
        case "eduAdmin":
          result = await eduAdminDB.deleteEduAdmin(entityId as string, dbUrl);
          break;
        case "school":
          result = await schoolDB.deleteSchool(entityId as string, dbUrl);
          break;
        default:
          return data(
            { status: "error", message: "Invalid entity type" },
            { status: 400 }
          );
      }

      return data({ status: "success", message: "تم الحذف بنجاح" });
    }


    // Handle create action
    if (actionType === "create") {

      // Fetch existing data to check for duplicates
      const [existingRegions, existingEduAdmins, existingSchools] = await Promise.all([
        regionDB.getAllRegions(dbUrl),
        eduAdminDB.getAllEduAdmins(dbUrl),
        schoolDB.getAllSchools(dbUrl),
      ]);

      const regionNames = (existingRegions.data || []).map((r: any) => r.name?.toLowerCase().trim());
      const eduAdminNames = (existingEduAdmins.data || []).map((e: any) => e.name?.toLowerCase().trim());
      const schoolNames = (existingSchools.data || []).map((s: any) => s.name?.toLowerCase().trim());

      let results = [];
      let duplicateNames: string[] = [];

      for (const name of names) {
        if (typeof name === "string" && name.trim() !== "") {
          const trimmedName = name.trim();
          const lowerName = trimmedName.toLowerCase();

          // Check for duplicates based on entity type
          let isDuplicate = false;
          switch (entityType) {
            case "region":
              isDuplicate = regionNames.includes(lowerName);
              break;
            case "eduAdmin":
              isDuplicate = eduAdminNames.includes(lowerName);
              break;
            case "school":
              isDuplicate = schoolNames.includes(lowerName);
              break;
          }

          if (isDuplicate) {
            duplicateNames.push(trimmedName);
            continue; // Skip creating this duplicate
          }

          let result;
          switch (entityType) {
            case "region":
              result = await regionDB.createRegion(trimmedName, dbUrl);
              regionNames.push(lowerName); // Add to list to prevent duplicates in same batch
              break;
            case "eduAdmin":
              // Pass the selected region's ID as regionId
              result = await eduAdminDB.createEduAdmin(
                trimmedName,
                dbUrl,
                parentId as string
              );
              eduAdminNames.push(lowerName); // Add to list to prevent duplicates in same batch
              break;
            case "school":
              // Pass the selected eduAdmin's ID as eduAdminId
              result = await schoolDB.createSchool(
                trimmedName,
                "",
                dbUrl,
                parentId as string
              );
              schoolNames.push(lowerName); // Add to list to prevent duplicates in same batch
              break;
            default:
              return data(
                { status: "error", message: "Invalid entity type" },
                { status: 400 }
              );
          }
          results.push(result);
        }
      }

      // Return appropriate response based on duplicates found
      if (duplicateNames.length > 0 && results.length === 0) {
        // All items were duplicates
        return data({
          status: "error",
          message: `الأسماء التالية موجودة بالفعل: ${duplicateNames.join("، ")}`,
          duplicateNames
        }, { status: 400 });
      } else if (duplicateNames.length > 0) {
        // Some items were duplicates, some were created
        return data({
          status: "warning",
          message: `تم إنشاء بعض العناصر. الأسماء التالية موجودة بالفعل ولم يتم إضافتها: ${duplicateNames.join("، ")}`,
          results,
          duplicateNames,
          createdEntityType: entityType,
          createdParentId: parentId
        });
      }

      return data({
        status: "success",
        message: "تم الإنشاء بنجاح",
        results,
        createdEntityType: entityType,
        createdParentId: parentId
      });
    }

    // Handle backup user data before migration
    if (actionType === "backupUserData") {
      const result = await userDB.backupUsersWithInvalidIds(dbUrl);
      return data(result);
    }

    // Handle restore user data from backup
    if (actionType === "restoreUserData") {
      const backupDataStr = formData.get("backupData") as string;
      if (!backupDataStr) {
        return data({ status: "error", message: "لا توجد بيانات للاستعادة" });
      }
      try {
        const backupData = JSON.parse(backupDataStr);
        const result = await userDB.restoreUsersFromBackup(backupData.users, dbUrl);
        return data(result);
      } catch (e) {
        return data({ status: "error", message: "خطأ في قراءة بيانات النسخة الاحتياطية" });
      }
    }

    // Handle user entity IDs migration
    if (actionType === "migrateUserEntityIds") {
      const result = await userDB.migrateUserEntityIds(dbUrl);
      return data(result);
    }

    // Handle download users backup before bulk fix
    if (actionType === "downloadUsersBackup") {

      // Users from the Excel file with issues - same list as bulkFixUsers
      const usersToBackup = [
        "bma14001@hotmail.com", "Seta8922@gmail.com", "Aljoria12345@gmail.com", "Amlalhdb@gmail.com",
        "agag23617@gmail.com", "manalhb11@gmail.com", "oolloll19876@gmail.com", "jjssh@hotmail.com",
        "foofoooo2009@hotmail.com", "binhaneen@gmail.com", "raghab335@gmail.com", "gkhm1396@gmail.com",
        "Physics7582@gmail.com", "omtariq7788@gmail.com", "Wafamnq2030@gmail.com", "Dee.sara7@gmail.com",
        "anbr1433@gmail.com", "ma4121071@gmail.com", "Samyhalzbydy1@gmail.com", "ghzylalshly@gmail.com",
        "s0567674837@yahoo.com", "A.ashwaqalmarwani@hotmail.com", "amalalghafli9@gmail.com",
        "a0553933644@gmail.com", "drah14000@gmail.com", "Sebraalarjani@gmail.com", "za1422@hotmail.com",
        "Sohair_h@hotmail.com", "siham.hakami@gmail.com", "Zaihi1989@gmail.com", "sjghazwani@moe.gov.sa",
        "wwd2012@hotma.com", "Eedah972@gmail.com", "Zakia1402z@gmail.com", "Walfaife@gmail.com",
        "Shmr03a04@gmail.com", "roromsh7@gmail.com", "ltyfazila90@gmail.com", "n1402u@hotmail.com",
        "asasf412@gmail.com", "Aleen4199@gmail.com", "norah.123789@yahoo.com", "alnonh61@gmail.com",
        "amfaisal1392x@gmail.com", "froooh7117@gmail.com", "Ssbe9876@gmail.com", "X00x18@hotmail.com",
        "zahraayahya0@gmail.com", "e.h111@hotmail.com", "zfs504@gmail.com", "noonaa_7@hotmail.com",
        "az6190565@gmail.com", "sh12sa12sh@gmail.com", "Heyam.ksa@hotmail.com", "amal333r@gmail.com",
        "Kmta80@gmail.com", "S10s103000@gmail.com", "al.7ake@hotmail.com", "Tapnajwan@gmail.com",
        "mona.muhawwis@gmail.com"
      ];

      const result = await userDB.getUsersBackupByEmails(usersToBackup, dbUrl);
      return data(result);
    }

    // Handle bulk fix user accounts
    if (actionType === "bulkFixUsers") {

      // Users from the Excel file with issues
      const usersToFix = [
        { email: "bma14001@hotmail.com", name: "بشرى محمد صالح العبلان", phone: "0535211708" },
        { email: "Seta8922@gmail.com", name: "صيته عبدالعزيز الذوادي", phone: "0506909450" },
        { email: "Aljoria12345@gmail.com", name: "عائشة محمد عطية", phone: "0552506749" },
        { email: "Amlalhdb@gmail.com", name: "امل عايش الحدب", phone: "0536881945" },
        { email: "agag23617@gmail.com", name: "ريم خالد الوسمي", phone: "0540294013" },
        { email: "manalhb11@gmail.com", name: "منال حسين البندر", phone: "0540021062" },
        { email: "oolloll19876@gmail.com", name: "ليلى علي رابح الرحيلي", phone: "0552135439" },
        { email: "jjssh@hotmail.com", name: "جملا حماد العمراني", phone: "0501933007" },
        { email: "foofoooo2009@hotmail.com", name: "فوزه سليم البلوي", phone: "0563329083" },
        { email: "binhaneen@gmail.com", name: "حنين احمد بن حسين", phone: "0533001456" },
        { email: "raghab335@gmail.com", name: "عيده فريج صالح البلوي", phone: "0502033581" },
        { email: "gkhm1396@gmail.com", name: "غادة خليفة الممتن", phone: "0555494336" },
        { email: "Physics7582@gmail.com", name: "صفية عبدالله الحبيب", phone: "0563552455" },
        { email: "omtariq7788@gmail.com", name: "فايقه يحيى عطيف", phone: "0552452191" },
        { email: "Wafamnq2030@gmail.com", name: "وفاء محمد القرافي", phone: "0506598085" },
        { email: "Dee.sara7@gmail.com", name: "ساره احمد الجيبان", phone: "0569766213" },
        { email: "anbr1433@gmail.com", name: "عنبر منور المطيري", phone: "0567273771" },
        { email: "ma4121071@gmail.com", name: "مريم أحمد المزيعل", phone: "0503912286" },
        { email: "Samyhalzbydy1@gmail.com", name: "ساميه محمد الزبيدي", phone: "0566221192" },
        { email: "ghzylalshly@gmail.com", name: "غزيل عيد السهلي", phone: "0566065096" },
        { email: "s0567674837@yahoo.com", name: "صديقه عبدالله الحميد", phone: "0567674837" },
        { email: "A.ashwaqalmarwani@hotmail.com", name: "أشواق ضيف الله المرواني", phone: "0563014492" },
        { email: "amalalghafli9@gmail.com", name: "أمل ابراهيم الغافلي", phone: "0569501113" },
        { email: "a0553933644@gmail.com", name: "لطيفة شامس النعيم", phone: "0500577656" },
        { email: "drah14000@gmail.com", name: "بدرة حسين الشيخ", phone: "0550533788" },
        { email: "Sebraalarjani@gmail.com", name: "صبره مساعد العرجاني", phone: "0532003817" },
        { email: "za1422@hotmail.com", name: "زهره حسن الجمعان", phone: "0504532436" },
        { email: "Sohair_h@hotmail.com", name: "سهير حبيب العليوي", phone: "0569790035" },
        { email: "siham.hakami@gmail.com", name: "سهام فهد حكمي", phone: "0556546027" },
        { email: "Zaihi1989@gmail.com", name: "رحمه ناصر ريحان", phone: "0550464908" },
        { email: "sjghazwani@moe.gov.sa", name: "صالحه جابر يحي غزواني", phone: "0506292177" },
        { email: "wwd2012@hotma.com", name: "وداد فريح البلوي", phone: "0597173791" },
        { email: "Eedah972@gmail.com", name: "عيدة مفلح العنزي", phone: "0590490491" },
        { email: "Zakia1402z@gmail.com", name: "زكيه حسين العيسى", phone: "0542760888" },
        { email: "Walfaife@gmail.com", name: "وضحه سالم جبار الفيفي", phone: "0538819774" },
        { email: "Shmr03a04@gmail.com", name: "شريفه علي العمري", phone: "0538718909" },
        { email: "roromsh7@gmail.com", name: "راويه محمد الشهري", phone: "0541010716" },
        { email: "ltyfazila90@gmail.com", name: "لطيفه محمد زيلع", phone: "0534594544" },
        { email: "n1402u@hotmail.com", name: "ندى عبداللطيف العبيد", phone: "0501125811" },
        { email: "asasf412@gmail.com", name: "اسمهان فالح البلوي", phone: "0505380412" },
        { email: "Aleen4199@gmail.com", name: "امل محمد رفاعي", phone: "0503096330" },
        { email: "norah.123789@yahoo.com", name: "نوره عتيق العطوي", phone: "0530610242" },
        { email: "alnonh61@gmail.com", name: "نوره عواد العنزي", phone: "0535134859" },
        { email: "amfaisal1392x@gmail.com", name: "مطره عبدالله سليمان الفيفي", phone: "0535432591" },
        { email: "froooh7117@gmail.com", name: "غاده عبد الكريم مدخلي", phone: "0559775023" },
        { email: "Ssbe9876@gmail.com", name: "صبيحه سويلم الحويطي", phone: "0546995290" },
        { email: "X00x18@hotmail.com", name: "سناء احمد العطوي", phone: "0542843844" },
        { email: "zahraayahya0@gmail.com", name: "زهراء يحي علي عسيري", phone: "0597472972" },
        { email: "e.h111@hotmail.com", name: "ايمان حسين موسى خفشة", phone: "0502710062" },
        { email: "zfs504@gmail.com", name: "فاطمه منصور صميلي", phone: "0533249881" },
        { email: "noonaa_7@hotmail.com", name: "نوره سعد مهدي", phone: "0552835486" },
        { email: "az6190565@gmail.com", name: "عزيزة عياد الخمعلي", phone: "0590759008" },
        { email: "sh12sa12sh@gmail.com", name: "شيخه ابراهيم الجلعود", phone: "0567450020" },
        { email: "Heyam.ksa@hotmail.com", name: "هيام خالد باصهي", phone: "0504793324" },
        { email: "amal333r@gmail.com", name: "أمل عبدالله التميمي", phone: "0503991894" },
        { email: "Kmta80@gmail.com", name: "المها بندر الخشرم", phone: "0534289780" },
        { email: "S10s103000@gmail.com", name: "علياء جمعه الحويطي", phone: "0567870701" },
        { email: "al.7ake@hotmail.com", name: "مريم سعد الهجله", phone: "0555175917" },
        { email: "Tapnajwan@gmail.com", name: "نجوان عبدالله الدوسري", phone: "0557002664" },
        { email: "mona.muhawwis@gmail.com", name: "منى مهوس الشمري", phone: "0553193999" }
      ];

      const result = await userDB.bulkFixUserAccounts(usersToFix, "Yaneah@2026", dbUrl);
      return data(result);
    }

    // Handle batch save action with proper hierarchical transaction support
    if (actionType === "batchSave") {
      for (const [key, value] of formData.entries()) {
      }

      const results: any[] = [];

      // Import database client for transaction
      const { client } = await import("~/db/db-client.server");
      const prisma = await client(dbUrl);
      
      try {
        // Start transaction for atomic hierarchical operations
        await prisma.$transaction(async (tx) => {
          
          if (entityType === "region") {
            // REGION BATCH SAVE: Sequential Processing - Region → EduAdmin1 + Schools → EduAdmin2 + Schools...
            
            // Step 1: Update the region name if provided
            if (names.length > 0 && typeof names[0] === "string" && names[0].trim() !== "") {
              const updateResult = await regionDB.updateRegion(entityId as string, names[0].trim(), dbUrl);
              results.push(updateResult);
            }

            // Step 2: Get all data for processing
            const newEduAdminsData = formData.getAll("newEduAdmins");
            const newSchoolsData = formData.getAll("newSchools");
            const newSchoolsForNewEduAdminsData = formData.getAll("newSchoolsForNewEduAdmins");

            
            // Debug: Log the actual data being processed
            
            

            // Step 3: Process existing eduAdmins and their schools first
            // Get existing eduAdmins from database for this region
            const existingEduAdminsResult = await eduAdminDB.getAllEduAdmins(dbUrl);
            const existingEduAdminsRaw = existingEduAdminsResult.status === "success" && existingEduAdminsResult.data
              ? existingEduAdminsResult.data
              : [];
            const existingEduAdminsData = (Array.isArray(existingEduAdminsRaw) ? existingEduAdminsRaw : [existingEduAdminsRaw]) as any[];
            const existingEduAdmins = existingEduAdminsData.filter((ea: any) => ea.regionId === entityId);
            
            for (const eduAdmin of existingEduAdmins as any[]) {
              
              // Find and create schools for this existing eduAdmin
              const schoolsForThisEduAdmin = [];
              for (const schoolData of newSchoolsData) {
                try {
                  const parsedSchool = JSON.parse(schoolData as string);
                  if (parsedSchool.name && parsedSchool.eduAdminId === eduAdmin.id) {
                    schoolsForThisEduAdmin.push(parsedSchool);
                  }
                } catch (error) {
                }
              }

              for (const school of schoolsForThisEduAdmin) {
                
                // Check if school already exists for this eduAdmin
                const existsResult = await schoolDB.checkSchoolExists(
                  school.name,
                  eduAdmin.id,
                  dbUrl
                );
                
                if (existsResult.status === "success" && existsResult.data && (existsResult.data as any).exists) {
                  continue;
                }
                
                const result = await schoolDB.createSchool(
                  school.name,
                  "",
                  dbUrl,
                  eduAdmin.id
                );
                
                results.push(result);
              }
            }

            // Step 4: Process new eduAdmins and their schools sequentially
            
            for (let i = 0; i < newEduAdminsData.length; i++) {
              const eduAdminData = newEduAdminsData[i];
              try {
                const parsedEduAdmin = JSON.parse(eduAdminData as string);
                if (parsedEduAdmin.name && parsedEduAdmin.regionId) {
                  // Use originalIndex if available (for matching with schools), otherwise fall back to i
                  const eduAdminOriginalIndex = parsedEduAdmin.originalIndex !== undefined ? parsedEduAdmin.originalIndex : i;

                  // Check if eduAdmin already exists for this region
                  const existsResult = await eduAdminDB.checkEduAdminExists(
                    parsedEduAdmin.name,
                    parsedEduAdmin.regionId,
                    dbUrl
                  );

                  let newEduAdminId;
                  const existsData = existsResult.data as any;
                  if (existsResult.status === "success" && existsData && existsData.exists) {
                    newEduAdminId = existsData.eduAdmin?.id;
                  } else {

                    // Create the eduAdmin first
                    const eduAdminResult = await eduAdminDB.createEduAdmin(
                      parsedEduAdmin.name,
                      dbUrl,
                      parsedEduAdmin.regionId  // Assign to parent region
                    );

                    results.push(eduAdminResult);
                    newEduAdminId = (eduAdminResult.data as any)?.id;
                  }

                  // Now create schools for this newly created eduAdmin
                  // Match by originalIndex to handle cases where empty eduAdmins were skipped
                  const schoolsForThisNewEduAdmin = [];
                  for (const schoolData of newSchoolsForNewEduAdminsData) {
                    try {
                      const parsedSchool = JSON.parse(schoolData as string);
                      if (parsedSchool.name && parsedSchool.newEduAdminIndex === eduAdminOriginalIndex) {
                        schoolsForThisNewEduAdmin.push(parsedSchool);
                      }
                    } catch (error) {
                    }
                  }

                  for (const school of schoolsForThisNewEduAdmin) {
                    
                    // Check if school already exists for this eduAdmin
                    const schoolExistsResult = await schoolDB.checkSchoolExists(
                      school.name,
                      newEduAdminId,
                      dbUrl
                    );
                    
                    if (schoolExistsResult.status === "success" && schoolExistsResult.data && (schoolExistsResult.data as any).exists) {
                      continue;
                    }
                    
                    const schoolResult = await schoolDB.createSchool(
                      school.name,
                      "",
                      dbUrl,
                      newEduAdminId  // Assign to parent eduAdmin
                    );
                    
                    results.push(schoolResult);
                  }
                }
              } catch (error: any) {
                throw new Error(`Failed to process eduAdmin ${i + 1}: ${error?.message || 'Unknown error'}`);
              }
            }


          } else if (entityType === "eduAdmin") {
            // EDUADMIN BATCH SAVE: EduAdmin → Schools inside it
            
            // Step 1: Update the eduAdmin name if provided
            if (names.length > 0 && typeof names[0] === "string" && names[0].trim() !== "") {
              const updateResult = await eduAdminDB.updateEduAdmin(entityId as string, { name: names[0].trim() }, dbUrl);
              results.push(updateResult);
            }

            // Step 2: Create all new schools for this eduAdmin
            const newSchoolsData = formData.getAll("newSchools");
            for (const schoolData of newSchoolsData) {
              try {
                const parsedSchool = JSON.parse(schoolData as string);
                
                if (parsedSchool.name && parsedSchool.eduAdminId && String(parsedSchool.eduAdminId) === String(entityId)) {
                  
                  // Check if school already exists for this eduAdmin
                  const existsResult = await schoolDB.checkSchoolExists(
                    parsedSchool.name,
                    parsedSchool.eduAdminId,
                    dbUrl
                  );
                  
                  if (existsResult.status === "success" && existsResult.data && (existsResult.data as any).exists) {
                    continue;
                  }
                  
                  const result = await schoolDB.createSchool(
                    parsedSchool.name,
                    "",
                    dbUrl,
                    parsedSchool.eduAdminId
                  );
                  
                  results.push(result);
                } else {
                }
              } catch (error: any) {
                throw new Error(`Failed to process school: ${error?.message || 'Unknown error'}`);
              }
            }

          } else {
            throw new Error("Invalid entity type for batch save");
          }
        });

        // Transaction completed successfully
        await prisma.$disconnect();
        
        
        return data({ 
          status: "success", 
          message: "تم الحفظ بنجاح", 
          results,
          savedEntityType: entityType,
          savedEntityId: entityId
        });
      } catch (transactionError) {
        await prisma.$disconnect();
        throw transactionError; // Re-throw to be caught by outer catch block
      }
    }

    return data(
      { status: "error", message: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    
    // Handle specific database errors
    let errorMessage = "حدث خطأ غير متوقع";
    
    if (error.message.includes("Unique constraint")) {
      errorMessage = "هذا الاسم موجود بالفعل، يرجى اختيار اسم آخر";
    } else if (error.message.includes("Foreign key constraint")) {
      errorMessage = "لا يمكن حذف هذا العنصر لأنه مرتبط بعناصر أخرى";
    } else if (error.message.includes("timeout")) {
      errorMessage = "انتهت مهلة الاتصال بقاعدة البيانات، يرجى المحاولة مرة أخرى";
    } else if (error.message.includes("Connection")) {
      errorMessage = "خطأ في الاتصال بقاعدة البيانات";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return data({ 
      status: "error", 
      message: errorMessage,
      errorCode: error.code || "UNKNOWN_ERROR",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
};

// --- Main Component ---
// This component implements a single-page hierarchical view:
// 1. Add new regions at the top
// 2. Each region shows its EduAdmins as expandable items
// 3. Each EduAdmin shows its schools as expandable items
// Everything happens on the same page without navigation

interface EntityItem {
  id: string;
  name: string;
  regionId?: string; // For eduAdmin items
  eduAdminId?: string; // For school items
  createdAt?: string | Date; // For sorting by creation date
}

export const ManageData = (): JSX.Element => {
  const data = useLoaderData() as {
    regions: EntityItem[];
    eduAdmins: EntityItem[];
    schools: EntityItem[];
  } | null;

  // Safe data access with fallbacks
  const safeData = {
    regions: data?.regions || [],
    eduAdmins: data?.eduAdmins || [],
    schools: data?.schools || [],
  };


  const actionData = useActionData() as
    | {
        status: string;
        message?: string;
        results?: any[];
        createdEntityType?: string;
        createdParentId?: string;
        savedEntityType?: string;
        savedEntityId?: string;
        data?: {
          eduAdminMatched?: number;
          eduAdminUnmatched?: number;
          schoolMatched?: number;
          schoolUnmatched?: number;
          unmatchedEduAdmins?: string[];
          unmatchedSchools?: string[];
          // Backup data
          backupDate?: string;
          usersCount?: number;
          users?: Array<{
            id: string;
            eduAdminId: string | null;
            schoolId: string | null;
            regionId: string | null;
          }>;
          // Restore data
          restored?: number;
        };
      }
    | undefined;

  const revalidator = useRevalidator();

  // State for new items
  const [newRegions, setNewRegions] = useState<string[]>([]);
  const [newEduAdmins, setNewEduAdmins] = useState<{
    [regionId: string]: string[];
  }>({});
  const [newSchools, setNewSchools] = useState<{
    [eduAdminId: string]: string[];
  }>({});

  // State for expanding/collapsing items
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set()
  );
  const [expandedEduAdmins, setExpandedEduAdmins] = useState<Set<string>>(
    new Set()
  );

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    entityType: string;
    entityId: string;
    entityName: string;
    hasChildren: boolean;
    childrenType: string;
    childrenCount: number;
  } | null>(null);

  // State for loading and debouncing
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [debounceTimers, setDebounceTimers] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});
  
  // State for error handling
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});

  // State for validation
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // State for bulk fix user accounts modal
  const [bulkFixModal, setBulkFixModal] = useState<{
    isOpen: boolean;
    isLoading: boolean;
    results: {
      processed: number;
      passwordReset: number;
      created: number;
      skipped: number;
      errors: Array<{ email: string; error: string }>;
    } | null;
    error: string | null;
  }>({
    isOpen: false,
    isLoading: false,
    results: null,
    error: null
  });

  // LocalStorage keys
  const STORAGE_KEYS = {
    newRegions: 'qyam-admin-new-regions',
    newEduAdmins: 'qyam-admin-new-eduadmins',
    newSchools: 'qyam-admin-new-schools',
  };

  // Load state from localStorage on component mount
  useEffect(() => {
    try {
      const savedNewRegions = localStorage.getItem(STORAGE_KEYS.newRegions);
      const savedNewEduAdmins = localStorage.getItem(STORAGE_KEYS.newEduAdmins);
      const savedNewSchools = localStorage.getItem(STORAGE_KEYS.newSchools);

      if (savedNewRegions) {
        setNewRegions(JSON.parse(savedNewRegions));
      }
      if (savedNewEduAdmins) {
        setNewEduAdmins(JSON.parse(savedNewEduAdmins));
      }
      if (savedNewSchools) {
        setNewSchools(JSON.parse(savedNewSchools));
      }
    } catch (error) {
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.newRegions, JSON.stringify(newRegions));
    } catch (error) {
    }
  }, [newRegions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.newEduAdmins, JSON.stringify(newEduAdmins));
    } catch (error) {
    }
  }, [newEduAdmins]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.newSchools, JSON.stringify(newSchools));
    } catch (error) {
    }
  }, [newSchools]);

  // Clear localStorage on successful saves
  const clearStorageForEntity = (entityType: string, entityId?: string) => {
    try {
      if (entityType === "region") {
        localStorage.removeItem(STORAGE_KEYS.newRegions);
        if (entityId) {
          const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.newEduAdmins) || '{}');
          delete current[entityId];
          localStorage.setItem(STORAGE_KEYS.newEduAdmins, JSON.stringify(current));
        }
      } else if (entityType === "eduAdmin" && entityId) {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.newEduAdmins) || '{}');
        delete current[entityId];
        localStorage.setItem(STORAGE_KEYS.newEduAdmins, JSON.stringify(current));
        
        const schools = JSON.parse(localStorage.getItem(STORAGE_KEYS.newSchools) || '{}');
        delete schools[entityId];
        localStorage.setItem(STORAGE_KEYS.newSchools, JSON.stringify(schools));
      } else if (entityType === "school" && entityId) {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.newSchools) || '{}');
        delete current[entityId];
        localStorage.setItem(STORAGE_KEYS.newSchools, JSON.stringify(current));
      }
    } catch (error) {
    }
  };

  // Update data when action returns success or error
  useEffect(() => {
    if (actionData?.status === "error") {
      // Handle error responses
      const errorMessage = actionData.message || "حدث خطأ غير متوقع";
      setErrors(prev => ({ ...prev, general: errorMessage }));
      
      // Clear all loading states on error
      setLoadingStates({});
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setErrors(prev => ({ ...prev, general: "" }));
      }, 5000);
    } else if (actionData?.status === "success") {
      // Clear all loading states on success
      setLoadingStates({});
      // Only clear state related to what was just saved
      if (actionData.createdEntityType === "region") {
        // Only clear new regions if a region was created
        setNewRegions([]);
        clearStorageForEntity("region");
      } else if (actionData.createdEntityType === "eduAdmin" && actionData.createdParentId) {
        // Only clear eduAdmins for the specific region
        const parentId = actionData.createdParentId;
        setNewEduAdmins(prev => ({
          ...prev,
          [parentId]: []
        }));
        clearStorageForEntity("eduAdmin", parentId);
      } else if (actionData.createdEntityType === "school" && actionData.createdParentId) {
        // Only clear schools for the specific eduAdmin
        const parentId = actionData.createdParentId;
        setNewSchools(prev => ({
          ...prev,
          [parentId]: []
        }));
        clearStorageForEntity("school", parentId);
      }

      // Handle batch save operations - clear relevant data based on what was saved
      if (actionData.message === "تم الحفظ بنجاح" && actionData.savedEntityType && actionData.savedEntityId) {
        const { savedEntityType, savedEntityId } = actionData;
        
        if (savedEntityType === "region") {
          // Region batch save completed - clear all eduAdmins and schools for this region
          setNewEduAdmins(prev => ({
            ...prev,
            [savedEntityId]: []
          }));
          
          // Also clear any schools that were created for eduAdmins in this region
          const eduAdminsInRegion = safeData.eduAdmins.filter(ea => ea.regionId === savedEntityId);
          setNewSchools(prev => {
            const updated = { ...prev };
            eduAdminsInRegion.forEach(ea => {
              updated[ea.id] = [];
            });
            return updated;
          });
          
          clearStorageForEntity("region", savedEntityId);
          
        } else if (savedEntityType === "eduAdmin") {
          // EduAdmin batch save completed - clear schools for this eduAdmin
          setNewSchools(prev => ({
            ...prev,
            [savedEntityId]: []
          }));
          
          clearStorageForEntity("eduAdmin", savedEntityId);
        }
      }

      setDeleteConfirmation(null); // Close delete confirmation on success
      
      // Revalidate to get updated data
      revalidator.revalidate();
      
      // Auto-add empty inputs based on what was just created
      if (actionData.createdEntityType && actionData.results && actionData.results.length > 0) {
        // Increased timeout to ensure revalidation completes first
        const results = actionData.results;
        setTimeout(() => {
          if (actionData.createdEntityType === "region") {
            // When a region is created, auto-add empty eduAdmin input
            const newRegionResult = results[0];
            if (newRegionResult?.success && newRegionResult.data?.id) {
              setNewEduAdmins(prev => ({
                ...prev,
                [newRegionResult.data.id]: [""]
              }));
            }
          } else if (actionData.createdEntityType === "eduAdmin" && actionData.createdParentId) {
            // When an eduAdmin is created, auto-add empty school input
            const newEduAdminResult = results[0];
            if (newEduAdminResult?.success && newEduAdminResult.data?.id) {
              setNewSchools(prev => ({
                ...prev,
                [newEduAdminResult.data.id]: [""]
              }));
            }
          }
        }, 300); // Increased from 100ms to 300ms
      }
    }
  }, [actionData, revalidator]);

  // Helper functions with safe navigation
  const getEduAdminsForRegion = (regionId: string): EntityItem[] => {
    if (!Array.isArray(safeData.eduAdmins) || !regionId) {
      return [];
    }
    return safeData.eduAdmins.filter(
      (eduAdmin) => eduAdmin?.regionId === regionId
    );
  };

  const getSchoolsForEduAdmin = (eduAdminId: string): EntityItem[] => {
    if (!Array.isArray(safeData.schools) || !eduAdminId) {
      return [];
    }
    return safeData.schools.filter(
      (school) => school?.eduAdminId === eduAdminId
    );
  };

  // Handle region expansion
  const toggleRegionExpansion = (regionId: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionId)) {
      newExpanded.delete(regionId);
    } else {
      newExpanded.add(regionId);
    }
    setExpandedRegions(newExpanded);
  };

  // Handle eduAdmin expansion
  const toggleEduAdminExpansion = (eduAdminId: string) => {
    const newExpanded = new Set(expandedEduAdmins);
    if (newExpanded.has(eduAdminId)) {
      newExpanded.delete(eduAdminId);
    } else {
      newExpanded.add(eduAdminId);
    }
    setExpandedEduAdmins(newExpanded);
  };

  // Handle adding inputs for regions
  const handleAddNewRegionCard = () => {
    setNewRegions([...newRegions, ""]);
  };

  const handleNewRegionInputChange = (index: number, value: string) => {
    const updated = [...newRegions];
    updated[index] = value;
    setNewRegions(updated);
  };

  const handleRemoveNewRegionCard = (index: number) => {
    const updated = newRegions.filter((_, i) => i !== index);
    setNewRegions(updated);
  };

  // Handle adding inputs for eduAdmins
  const handleAddEduAdminInput = (regionId: string) => {
    setNewEduAdmins((prev) => ({
      ...prev,
      [regionId]: [...(prev[regionId] || []), ""],
    }));
  };

  const handleEduAdminInputChange = (
    regionId: string,
    index: number,
    value: string
  ) => {
    setNewEduAdmins((prev) => {
      const updated = [...(prev[regionId] || [])];
      updated[index] = value;
      return { ...prev, [regionId]: updated };
    });
  };

  const handleRemoveEduAdminInput = (regionId: string, index: number) => {
    setNewEduAdmins((prev) => {
      const current = prev[regionId] || [];
      const updated = current.filter((_, i) => i !== index);
      return { ...prev, [regionId]: updated };
    });
  };

  // Handle adding inputs for schools
  const handleAddSchoolInput = (eduAdminId: string) => {
    setNewSchools((prev) => ({
      ...prev,
      [eduAdminId]: [...(prev[eduAdminId] || []), ""],
    }));
  };

  const handleSchoolInputChange = (
    eduAdminId: string,
    index: number,
    value: string
  ) => {
    setNewSchools((prev) => {
      const updated = [...(prev[eduAdminId] || [])];
      updated[index] = value;
      return { ...prev, [eduAdminId]: updated };
    });
  };

  const handleRemoveSchoolInput = (eduAdminId: string, index: number) => {
    setNewSchools((prev) => {
      const current = prev[eduAdminId] || [];
      const updated = current.filter((_, i) => i !== index);
      return { ...prev, [eduAdminId]: updated };
    });
  };

  // Handle delete confirmation
  const handleDeleteClick = (
    entityType: string,
    entityId: string,
    entityName: string
  ) => {
    let hasChildren = false;
    let childrenType = "";
    let childrenCount = 0;

    if (entityType === "region") {
      const eduAdmins = getEduAdminsForRegion(entityId);
      hasChildren = eduAdmins.length > 0;
      childrenType = "إدارات تعليمية";
      childrenCount = eduAdmins.length;
    } else if (entityType === "eduAdmin") {
      const schools = getSchoolsForEduAdmin(entityId);
      hasChildren = schools.length > 0;
      childrenType = "مدارس";
      childrenCount = schools.length;
    }

    setDeleteConfirmation({
      isOpen: true,
      entityType,
      entityId,
      entityName,
      hasChildren,
      childrenType,
      childrenCount,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      // Create form data
      const formData = new FormData();
      formData.append("actionType", "delete");
      formData.append("entityType", deleteConfirmation.entityType);
      formData.append("entityId", deleteConfirmation.entityId);

      // Send delete request
      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Revalidate data without page refresh
        revalidator.revalidate();
        setDeleteConfirmation(null);
      } else {
        // You could add error handling here
      }
    } catch (error) {
      // You could add error handling here
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Save handler for batch operations
  const handleSaveClick = (formId: string, buttonElement: HTMLButtonElement) => {
    // Check if this form is already submitting or has an active debounce timer
    if (loadingStates[formId] || debounceTimers[formId]) {
      return; // Prevent rapid clicks
    }

    // Set loading state immediately
    setLoadingStates(prev => ({ ...prev, [formId]: true }));

    // Set debounce timer to prevent rapid subsequent clicks
    const timer = setTimeout(() => {
      setDebounceTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[formId];
        return newTimers;
      });
    }, 2000);

    setDebounceTimers(prev => ({ ...prev, [formId]: timer }));

    // Find the form and submit it
    const form = buttonElement.closest('form');
    if (form) {
      form.requestSubmit();
    }
  };

  // Function to inject all current input values into the form
  // Validation functions
  const validateName = (name: string, fieldId: string): string => {
    let error = "";
    
    if (!name.trim()) {
      error = "هذا الحقل مطلوب";
    } else if (name.trim().length < 2) {
      error = "يجب أن يكون الاسم أكثر من حرفين";
    } else if (name.trim().length > 100) {
      error = "يجب أن يكون الاسم أقل من 100 حرف";
    } else if (!/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+$/.test(name.trim())) {
      error = "يجب أن يحتوي الاسم على أحرف عربية فقط";
    }
    
    setValidationErrors(prev => ({ ...prev, [fieldId]: error }));
    return error;
  };

  const validateUniqueRegionName = (name: string, excludeId?: string): string => {
    const existingRegion = safeData.regions.find(r => 
      r.id !== excludeId && r.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    
    if (existingRegion) {
      return "اسم المنطقة موجود بالفعل";
    }
    
    return "";
  };

  const validateUniqueEduAdminName = (name: string, regionId: string, excludeId?: string): string => {
    const existingEduAdmin = safeData.eduAdmins.find(ea => 
      ea?.id !== excludeId && 
      ea?.regionId === regionId && 
      ea?.name?.toLowerCase()?.trim() === name?.toLowerCase()?.trim()
    );
    
    if (existingEduAdmin) {
      return "اسم الإدارة التعليمية موجود بالفعل في هذه المنطقة";
    }
    
    return "";
  };

  const validateUniqueSchoolName = (name: string, eduAdminId: string, excludeId?: string): string => {
    const existingSchool = safeData?.schools?.find(s => 
      s?.id !== excludeId && 
      s?.eduAdminId === eduAdminId && 
      s?.name?.toLowerCase()?.trim() === name?.toLowerCase()?.trim()
    );
    
    if (existingSchool) {
      return "اسم المدرسة موجود بالفعل في هذه الإدارة التعليمية";
    }
    
    return "";
  };

  // Real-time validation handlers
  const handleRegionNameChange = (value: string, fieldId: string) => {
    const basicError = validateName(value, fieldId);
    if (!basicError && value.trim()) {
      const uniqueError = validateUniqueRegionName(value);
      setValidationErrors(prev => ({ ...prev, [fieldId]: uniqueError }));
    }
  };

  const handleEduAdminNameChange = (value: string, fieldId: string, regionId: string) => {
    const basicError = validateName(value, fieldId);
    if (!basicError && value.trim()) {
      const uniqueError = validateUniqueEduAdminName(value, regionId);
      setValidationErrors(prev => ({ ...prev, [fieldId]: uniqueError }));
    }
  };

  const handleSchoolNameChange = (value: string, fieldId: string, eduAdminId: string) => {
    const basicError = validateName(value, fieldId);
    if (!basicError && value.trim()) {
      const uniqueError = validateUniqueSchoolName(value, eduAdminId);
      setValidationErrors(prev => ({ ...prev, [fieldId]: uniqueError }));
    }
  };

  // Check if region has any validation errors in its hierarchy
  const hasRegionHierarchyErrors = (regionId: string): boolean => {
    // Check region itself
    if (validationErrors[`region-${regionId}-input`]) {
      return true;
    }

    // Check new eduAdmins for this region
    const eduAdminsForRegion = newEduAdmins[regionId] || [];
    for (let i = 0; i < eduAdminsForRegion.length; i++) {
      if (validationErrors[`new-eduadmin-${regionId}-${i}`]) {
        return true;
      }

      // Check schools for new eduAdmins
      const schoolsForNewEduAdmin = newSchools[`new-eduadmin-${regionId}-${i}`] || [];
      for (let j = 0; j < schoolsForNewEduAdmin.length; j++) {
        if (validationErrors[`new-school-${regionId}-${i}-${j}`]) {
          return true;
        }
      }
    }

    // Check existing eduAdmins and their schools
    const existingEduAdmins = getEduAdminsForRegion(regionId);
    for (const eduAdmin of existingEduAdmins) {
      if (validationErrors[`eduadmin-${eduAdmin.id}-input`]) {
        return true;
      }

      const schoolsForEduAdmin = newSchools[eduAdmin.id] || [];
      for (let k = 0; k < schoolsForEduAdmin.length; k++) {
        if (validationErrors[`school-${eduAdmin.id}-${k}`]) {
          return true;
        }
      }
    }

    return false;
  };

  return (
    <div className="h-full pb-20 [direction:rtl]">
      {/* Global Error Display */}
      {errors.general && (
        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <XIcon className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Data Migration Section */}
      <div className="w-full bg-white rounded-2xl border border-solid border-[#d0d5dd] mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#181d27]">إصلاح بيانات المستخدمين</h3>
              <p className="text-sm text-[#535861] mt-1">
                ربط بيانات الإدارات التعليمية والمدارس القديمة بالمعرفات الصحيحة
              </p>
            </div>
            <div className="flex gap-2">
              {/* Backup Button */}
              <Form method="post">
                <input type="hidden" name="actionType" value="backupUserData" />
                <Button
                  type="submit"
                  variant="outline"
                  className="px-4 py-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  نسخة احتياطية
                </Button>
              </Form>
              {/* Upload Restore Button */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                      const text = await file.text();
                      const backupData = JSON.parse(text);

                      if (!backupData.users || !Array.isArray(backupData.users)) {
                        alert("ملف النسخة الاحتياطية غير صالح");
                        return;
                      }

                      // Submit restore form
                      const formData = new FormData();
                      formData.append("actionType", "restoreUserData");
                      formData.append("backupData", JSON.stringify(backupData));

                      const response = await fetch(window.location.pathname, {
                        method: "POST",
                        body: formData,
                      });

                      if (response.ok) {
                        revalidator.revalidate();
                        alert("تم استعادة البيانات بنجاح");
                      } else {
                        alert("فشل استعادة البيانات");
                      }
                    } catch (error) {
                      alert("خطأ في قراءة الملف");
                    }

                    // Reset input
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="px-4 py-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                  asChild
                >
                  <span>استعادة من ملف</span>
                </Button>
              </label>
              {/* Migration Button */}
              <Form method="post">
                <input type="hidden" name="actionType" value="migrateUserEntityIds" />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={loadingStates["migrate-users"]}
                  className="px-6 py-2"
                >
                  {loadingStates["migrate-users"] ? "جاري الإصلاح..." : "إصلاح البيانات"}
                </Button>
              </Form>
              {/* Delete Local Storage Button */}
              <Button
                type="button"
                variant="outline"
                className="px-4 py-2 border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (confirm("هل أنت متأكد من حذف جميع البيانات المخزنة محلياً؟ سيتم حذف جميع التعديلات غير المحفوظة.")) {
                    localStorage.clear();
                    alert("تم حذف البيانات المحلية بنجاح");
                    window.location.reload();
                  }
                }}
              >
                حذف البيانات المحلية
              </Button>
            </div>
          </div>

          {/* Backup Results */}
          {actionData?.data?.backupDate && actionData?.data?.users && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-blue-800 mb-2">النسخة الاحتياطية:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>📅 تاريخ النسخة: {new Date(actionData.data.backupDate).toLocaleString('ar-SA')}</li>
                <li>👥 عدد المستخدمين: {actionData.data.usersCount}</li>
              </ul>

              {/* Download backup as JSON */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = JSON.stringify(actionData.data, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `user-backup-${actionData.data?.backupDate?.split('T')[0]}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-sm text-blue-700 underline hover:text-blue-900"
                >
                  تحميل النسخة الاحتياطية (JSON)
                </button>
              </div>

              {/* Restore Form */}
              <Form method="post" className="mt-3 pt-3 border-t border-blue-200">
                <input type="hidden" name="actionType" value="restoreUserData" />
                <input type="hidden" name="backupData" value={JSON.stringify(actionData.data)} />
                <Button
                  type="submit"
                  variant="outline"
                  className="text-sm px-4 py-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  استعادة من هذه النسخة
                </Button>
              </Form>
            </div>
          )}

          {/* Restore Results */}
          {actionData?.data?.restored !== undefined && actionData?.data?.eduAdminMatched === undefined && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-amber-800 mb-2">نتيجة الاستعادة:</h4>
              <p className="text-sm text-amber-700">
                ✅ تم استعادة {actionData.data.restored} مستخدم
              </p>
            </div>
          )}

          {/* Migration Results */}
          {actionData?.data?.eduAdminMatched !== undefined && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-green-800 mb-2">نتائج الإصلاح:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ تم ربط {actionData.data.eduAdminMatched} إدارة تعليمية</li>
                <li>✅ تم ربط {actionData.data.schoolMatched} مدرسة</li>
                {actionData.data.eduAdminUnmatched! > 0 && (
                  <li className="text-amber-700">⚠️ لم يتم العثور على {actionData.data.eduAdminUnmatched} إدارة تعليمية</li>
                )}
                {actionData.data.schoolUnmatched! > 0 && (
                  <li className="text-amber-700">⚠️ لم يتم العثور على {actionData.data.schoolUnmatched} مدرسة</li>
                )}
              </ul>

              {/* Show unmatched names if any */}
              {actionData.data.unmatchedEduAdmins && actionData.data.unmatchedEduAdmins.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-sm font-medium text-amber-700 mb-1">إدارات تعليمية غير موجودة:</p>
                  <ul className="text-xs text-amber-600 list-disc list-inside">
                    {actionData.data.unmatchedEduAdmins.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {actionData.data.unmatchedSchools && actionData.data.unmatchedSchools.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-sm font-medium text-amber-700 mb-1">مدارس غير موجودة:</p>
                  <ul className="text-xs text-amber-600 list-disc list-inside">
                    {actionData.data.unmatchedSchools.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Fix User Accounts Section - Hidden (operation complete) */}
      {false && (<>
      <div className="w-full bg-white rounded-2xl border border-solid border-[#d0d5dd] mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#181d27]">إصلاح حسابات المستخدمين</h3>
              <p className="text-sm text-[#535861] mt-1">
                إعادة تعيين كلمات المرور للمستخدمين الذين لديهم مشاكل في تسجيل الدخول (68 مستخدم)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="px-4 py-2 border-green-300 text-green-700 hover:bg-green-50"
                onClick={async () => {
                  try {
                    const formData = new FormData();
                    formData.append("actionType", "downloadUsersBackup");

                    const response = await fetch(window.location.pathname, {
                      method: "POST",
                      body: formData,
                    });

                    const result = await response.json() as { status: string; data?: any; message?: string };

                    if (result.status === "success" && result.data) {
                      // Create and download JSON file
                      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `users-backup-${new Date().toISOString().slice(0, 10)}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    } else {
                      alert(result.message || "حدث خطأ أثناء تحميل النسخة الاحتياطية");
                    }
                  } catch (error: any) {
                    alert(error.message || "فشل الاتصال بالخادم");
                  }
                }}
              >
                تحميل نسخة احتياطية
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-6 py-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                onClick={async () => {
                  // Open modal and start processing
                  setBulkFixModal({
                    isOpen: true,
                    isLoading: true,
                    results: null,
                    error: null
                  });

                  try {
                    const formData = new FormData();
                    formData.append("actionType", "bulkFixUsers");

                    const response = await fetch(window.location.pathname, {
                      method: "POST",
                      body: formData,
                    });

                    const result = await response.json() as { status: string; data?: any; message?: string };

                    if (result.status === "success" && result.data) {
                      setBulkFixModal(prev => ({
                        ...prev,
                        isLoading: false,
                        results: result.data,
                        error: null
                      }));
                    } else {
                      setBulkFixModal(prev => ({
                        ...prev,
                        isLoading: false,
                        error: result.message || "حدث خطأ غير متوقع"
                      }));
                    }
                  } catch (error: any) {
                    setBulkFixModal(prev => ({
                      ...prev,
                      isLoading: false,
                      error: error.message || "فشل الاتصال بالخادم"
                    }));
                  }
                }}
              >
                إصلاح حسابات المستخدمين
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Fix User Accounts Modal */}
      {bulkFixModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-purple-50">
              <h3 className="text-lg font-bold text-purple-800">إصلاح حسابات المستخدمين</h3>
              {!bulkFixModal.isLoading && (
                <button
                  type="button"
                  onClick={() => setBulkFixModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-1 hover:bg-purple-100 rounded-full transition-colors"
                >
                  <XIcon className="w-5 h-5 text-purple-700" />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Loading State */}
              {bulkFixModal.isLoading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium text-gray-700">جاري معالجة الحسابات...</p>
                  <p className="text-sm text-gray-500 mt-2">يرجى الانتظار، هذه العملية قد تستغرق بعض الوقت</p>
                </div>
              )}

              {/* Error State */}
              {!bulkFixModal.isLoading && bulkFixModal.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">حدث خطأ</h4>
                  <p className="text-sm text-red-700">{bulkFixModal.error}</p>
                </div>
              )}

              {/* Success State */}
              {!bulkFixModal.isLoading && bulkFixModal.results && (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-700">{bulkFixModal.results.passwordReset}</p>
                      <p className="text-xs text-green-600">تم إعادة تعيين كلمة المرور</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-700">{bulkFixModal.results.created}</p>
                      <p className="text-xs text-blue-600">حساب جديد تم إنشاؤه</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-700">{bulkFixModal.results.processed}</p>
                      <p className="text-xs text-gray-600">إجمالي المعالجة</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-amber-700">{bulkFixModal.results.skipped}</p>
                      <p className="text-xs text-amber-600">تم تخطيه (مكرر)</p>
                    </div>
                  </div>

                  {/* Errors Section */}
                  {bulkFixModal.results.errors && bulkFixModal.results.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">
                        الأخطاء ({bulkFixModal.results.errors.length})
                      </h4>
                      <ul className="text-xs text-red-600 list-disc list-inside max-h-32 overflow-y-auto space-y-1">
                        {bulkFixModal.results.errors.map((err, i) => (
                          <li key={i}>{err.email}: {err.error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Default Password Info */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-800">
                      <span className="font-medium">كلمة المرور الافتراضية:</span>{" "}
                      <code className="bg-purple-100 px-2 py-0.5 rounded font-mono text-purple-900">Yaneah@2026</code>
                    </p>
                    <p className="text-xs text-purple-600 mt-2">
                      يرجى إبلاغ المستخدمين بتغيير كلمة المرور عند أول تسجيل دخول
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!bulkFixModal.isLoading && (
              <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
                <Button
                  type="button"
                  onClick={() => setBulkFixModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  إغلاق
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      </>)}

      {/* Single Region Add Section - As shown in image.png */}
      <div className="w-full bg-white rounded-2xl border border-solid border-[#d0d5dd] mt-8">
        <div className="p-6">
          <Form method="post" className="space-y-4">
            <input type="hidden" name="actionType" value="create" />
            <input type="hidden" name="entityType" value="region" />

            {/* Header Section - Teal background with save button and title */}
            <div className="flex w-full h-14 items-center justify-between gap-3 p-5 bg-[#006173] rounded-xl shadow-shadows-shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 bg-white rounded-md overflow-hidden border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic flex items-center justify-center">
                  <img src={UserIcon} alt="" className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-base leading-6">
                  إضافة منطقة جديدة
                </span>
              </div>
              <button
                type="button"
                disabled={loadingStates["new-region-form"] || !!validationErrors["new-region-input"]}
                onClick={(e) => !loadingStates["new-region-form"] && !validationErrors["new-region-input"] && handleSaveClick("new-region-form", e.currentTarget)}
                className="py-1.5 px-8 bg-white border border-[#D5D7DA] rounded-lg text-[#535861] font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStates["new-region-form"] ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>

            {/* Input Section */}
            <div className="space-y-3">
              <label className="block text-[#535861] font-medium text-sm">
                المنطقة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="itemName"
                placeholder="اكتب المنطقة المراد اضافتها"
                className={`w-full px-4 py-3 bg-white border rounded-lg text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:border-transparent ${
                  validationErrors["new-region-input"]
                    ? "border-red-500 focus:ring-red-500"
                    : "border-[#D5D7DA] focus:ring-[#17b169]"
                }`}
                onChange={(e) => handleRegionNameChange(e.target.value, "new-region-input")}
                required
              />

              {/* Validation Error for new region input */}
              {validationErrors["new-region-input"] && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-xs text-red-600">{validationErrors["new-region-input"]}</p>
                </div>
              )}

              {/* Error Display for new region form */}
              {errors["new-region-form"] && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{errors["new-region-form"]}</p>
                </div>
              )}
            </div>
          </Form>
        </div>
      </div>

      {/* Dynamic API-driven Hierarchy - Using exact template design */}
      <div className="w-full bg-white rounded-2xl border border-solid border-[#d0d5dd] mt-8">
        <div className="p-6">
          {/* Dynamic Regions from API - Newest first */}
          {Array.isArray(safeData.regions) &&
            safeData.regions
              .slice()
              .sort((a, b) => {
                // Sort by creation date if available, otherwise by ID (newest first)
                if (a.createdAt && b.createdAt) {
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                // Fallback to ID sorting (assuming higher ID = newer)
                return b.id.localeCompare(a.id, undefined, { numeric: true });
              })
              .map((region) => (
              <div key={region.id} className="bg-white rounded-xl border-2 border-[#D5D7DA] shadow-lg p-6 mb-8">
                {/* Region Form - Using region data */}
                <Form method="post" className="space-y-4 mb-8">
                  <input type="hidden" name="actionType" value="batchSave" />
                  <input type="hidden" name="entityType" value="region" />
                  <input type="hidden" name="entityId" value={region.id} />

                  {/* Hidden inputs for new eduAdmins */}
                  {newEduAdmins[region.id]?.map((eduAdminName, index) => (
                    eduAdminName.trim() && (
                      <input
                        key={`hidden-eduadmin-${index}`}
                        type="hidden"
                        name="newEduAdmins"
                        value={JSON.stringify({ name: eduAdminName.trim(), regionId: region.id, originalIndex: index })}
                      />
                    )
                  ))}

                  {/* Hidden inputs for schools of existing eduAdmins */}
                  {getEduAdminsForRegion(region.id).map((eduAdmin) => (
                    newSchools[eduAdmin.id]?.map((schoolName, index) => (
                      schoolName.trim() && (
                        <input
                          key={`hidden-school-existing-${eduAdmin.id}-${index}`}
                          type="hidden"
                          name="newSchools"
                          value={JSON.stringify({ name: schoolName.trim(), eduAdminId: eduAdmin.id })}
                        />
                      )
                    ))
                  ))}

                  {/* Hidden inputs for schools of new eduAdmins */}
                  {newEduAdmins[region.id]?.map((_, eduAdminIndex) => (
                    newSchools[`new-eduadmin-${region.id}-${eduAdminIndex}`]?.map((schoolName, schoolIndex) => (
                      schoolName.trim() && (
                        <input
                          key={`hidden-school-new-${eduAdminIndex}-${schoolIndex}`}
                          type="hidden"
                          name="newSchoolsForNewEduAdmins"
                          value={JSON.stringify({
                            name: schoolName.trim(),
                            newEduAdminIndex: eduAdminIndex,
                            regionId: region.id
                          })}
                        />
                      )
                    ))
                  ))}

                  <div className="flex items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold text-[#181d27] min-w-0 truncate">{region.name}</h3>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        disabled={loadingStates[`region-${region.id}`] || hasRegionHierarchyErrors(region.id)}
                        onClick={(e) => !loadingStates[`region-${region.id}`] && !hasRegionHierarchyErrors(region.id) && handleSaveClick(`region-${region.id}`, e.currentTarget)}
                        className="px-6 py-2 bg-[#17b169] border border-[#17b169] rounded-lg text-white font-medium hover:bg-[#15a062] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        title={hasRegionHierarchyErrors(region.id) ? "يرجى إصلاح الأخطاء في الحقول قبل الحفظ" : "حفظ المنطقة وجميع الإدارات والمدارس"}
                      >
                        {loadingStates[`region-${region.id}`] ? "جاري الحفظ..." : "حفظ الكل"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddEduAdminInput(region.id)}
                        className="w-8 h-8 bg-[#17b169] rounded-lg flex items-center justify-center hover:bg-[#15a062] transition-colors shadow-sm shrink-0"
                        title="إضافة إدارة تعليم"
                      >
                        <span className="text-white text-sm font-bold">+</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick("region", region.id, region.name)}
                        className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm shrink-0"
                        title="حذف المنطقة"
                      >
                        <XIcon className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    name="itemName"
                    defaultValue={region.name}
                    placeholder="اكتب اسم المنطقة المراد اضافتها"
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:border-transparent ${
                      validationErrors[`region-${region.id}-input`]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-[#D5D7DA] focus:ring-[#17b169]"
                    }`}
                    onChange={(e) => handleRegionNameChange(e.target.value, `region-${region.id}-input`)}
                    required
                  />

                  {/* Validation Error for region input */}
                  {validationErrors[`region-${region.id}-input`] && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <p className="text-xs text-red-600">{validationErrors[`region-${region.id}-input`]}</p>
                    </div>
                  )}
                </Form>

                {/* New EduAdmin Inputs - Show first */}
                {region?.id &&
                newEduAdmins[region.id] &&
                Array.isArray(newEduAdmins[region.id]) &&
                newEduAdmins[region.id].map((eduAdminName, index) => (
                  <div key={`new-eduadmin-${index}`} className="bg-white rounded-2xl border border-solid border-[#d0d5dd] p-8 mb-6">
                    <Form method="post" className="space-y-4 mb-8">
                      <input type="hidden" name="actionType" value="create" />
                      <input type="hidden" name="entityType" value="eduAdmin" />
                      <input type="hidden" name="parentId" value={region.id} />

                      <div className="flex items-center justify-between gap-4 mb-6">
                        <h3 className="text-lg font-bold text-[#181d27] min-w-0 truncate">إدارة جديدة</h3>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveEduAdminInput(region.id, index)}
                            className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm shrink-0"
                            title="إزالة الإدارة"
                          >
                            <XIcon className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        name="itemName"
                        value={eduAdminName}
                        data-eduadmin-region={region.id}
                        data-eduadmin-index={index}
                        onChange={(e) => {
                          handleEduAdminInputChange(region.id, index, e.target.value);
                          handleEduAdminNameChange(e.target.value, `new-eduadmin-${region.id}-${index}`, region.id);
                        }}
                        placeholder="اكتب اسم الإدارة المراد اضافتها"
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:border-transparent ${
                          validationErrors[`new-eduadmin-${region.id}-${index}`]
                            ? "border-red-500 focus:ring-red-500"
                            : "border-[#D5D7DA] focus:ring-[#17b169]"
                        }`}
                        required
                      />

                      {/* Validation Error for new eduAdmin input */}
                      {validationErrors[`new-eduadmin-${region.id}-${index}`] && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                          <p className="text-xs text-red-600">{validationErrors[`new-eduadmin-${region.id}-${index}`]}</p>
                        </div>
                      )}
                    </Form>

                    {/* Schools section for new eduAdmin */}
                    <div className="mt-6 border-t border-[#E5E7EB] pt-6">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <h4 className="text-base font-semibold text-[#181d27] min-w-0 truncate">المدارس</h4>
                        <button
                          type="button"
                          onClick={() => handleAddSchoolInput(`new-eduadmin-${region.id}-${index}`)}
                          className="w-8 h-8 bg-[#17b169] rounded-lg flex items-center justify-center hover:bg-[#15a062] transition-colors shadow-sm shrink-0"
                          title="إضافة مدرسة"
                        >
                          <span className="text-white text-sm font-bold">+</span>
                        </button>
                      </div>

                      {/* New Schools for this new EduAdmin */}
                      <div className="space-y-3">
                        {newSchools[`new-eduadmin-${region.id}-${index}`] &&
                        newSchools[`new-eduadmin-${region.id}-${index}`].map((schoolName, schoolIndex) => (
                          <div key={schoolIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={schoolName}
                              data-school-region={region.id}
                              data-new-eduadmin-index={index}
                              data-school-index={schoolIndex}
                              onChange={(e) => handleSchoolInputChange(`new-eduadmin-${region.id}-${index}`, schoolIndex, e.target.value)}
                              placeholder="اكتب اسم المدرسة المراد اضافتها"
                              className="flex-1 min-w-0 px-4 py-3 bg-white border border-[#D5D7DA] rounded-lg text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#17b169] focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSchoolInput(`new-eduadmin-${region.id}-${index}`, schoolIndex)}
                              className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors shrink-0"
                              title="إزالة المدرسة"
                            >
                              <XIcon className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Dynamic EduAdmins for this Region */}
                {getEduAdminsForRegion(region.id).map((eduAdmin) => (
                  <div key={eduAdmin.id} className="bg-white rounded-2xl border border-solid border-[#d0d5dd] p-8 mb-6">
                    {/* EduAdmin Form - Using eduAdmin data */}
                    <Form method="post" className="space-y-4 mb-8">
                      <input type="hidden" name="actionType" value="batchSave" />
                      <input type="hidden" name="entityType" value="eduAdmin" />
                      <input type="hidden" name="entityId" value={eduAdmin.id} />
                      <input type="hidden" name="parentId" value={region.id} />
                      
                      {/* Include all new schools for this eduAdmin */}
                      {newSchools[eduAdmin.id] && newSchools[eduAdmin.id].map((schoolName, index) => (
                        schoolName.trim() && (
                          <input
                            key={index}
                            type="hidden"
                            name="newSchools"
                            value={JSON.stringify({ name: schoolName.trim(), eduAdminId: eduAdmin.id })}
                          />
                        )
                      ))}

                      <div className="flex items-center justify-between gap-4 mb-6">
                        <h3 className="text-lg font-bold text-[#181d27] min-w-0 truncate">{eduAdmin.name}</h3>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddSchoolInput(eduAdmin.id)}
                            className="w-8 h-8 bg-[#17b169] rounded-lg flex items-center justify-center hover:bg-[#15a062] transition-colors shadow-sm shrink-0"
                            title="إضافة مدرسة"
                          >
                            <span className="text-white text-sm font-bold">+</span>
                          </button>
                          {/* Delete button hidden - foreign key constraints prevent deletion */}
                        </div>
                      </div>

                      <input
                        type="text"
                        name="itemName"
                        defaultValue={eduAdmin.name}
                        placeholder="اكتب اسم الإدارة المراد اضافتها"
                        className="w-full px-4 py-3 bg-white border border-[#D5D7DA] rounded-lg text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#17b169] focus:border-transparent"
                        required
                      />
                    </Form>

                    {/* Dynamic Schools for this EduAdmin */}
                    <div className="mt-6 border-t border-[#E5E7EB] pt-6">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <h4 className="text-base font-semibold text-[#181d27] min-w-0 truncate">المدارس</h4>
                        <button
                          type="button"
                          onClick={() => handleAddSchoolInput(eduAdmin.id)}
                          className="w-8 h-8 bg-[#17b169] rounded-lg flex items-center justify-center hover:bg-[#15a062] transition-colors shadow-sm shrink-0"
                          title="إضافة مدرسة"
                        >
                          <span className="text-white text-sm font-bold">+</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* New School Inputs - Show first */}
                        {newSchools[eduAdmin.id] &&
                        newSchools[eduAdmin.id].map((schoolName, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={schoolName}
                              data-school-region={region.id}
                              data-eduadmin-id={eduAdmin.id}
                              data-school-index={index}
                              onChange={(e) => handleSchoolInputChange(eduAdmin.id, index, e.target.value)}
                              placeholder="اكتب اسم المدرسة المراد اضافتها"
                              className="flex-1 min-w-0 px-4 py-3 bg-white border border-[#D5D7DA] rounded-lg text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#17b169] focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSchoolInput(eduAdmin.id, index)}
                              className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors shrink-0"
                              title="إزالة المدرسة"
                            >
                              <XIcon className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}

                        {/* Show existing schools */}
                        {getSchoolsForEduAdmin(eduAdmin.id).map((school) => (
                          <div key={school.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              defaultValue={school.name}
                              className="flex-1 min-w-0 px-4 py-3 bg-gray-50 border border-[#D5D7DA] rounded-lg text-[#535861]"
                              readOnly
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteClick("school", school.id, school.name)}
                              className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors shrink-0"
                              title="حذف المدرسة"
                            >
                              <XIcon className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            ))}        

          {safeData.regions.length === 0 && (
            <div className="text-center text-[#717680] py-8">
              لا توجد مناطق متاحة - استخدم النموذج أعلاه لإضافة منطقة جديدة
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation?.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-[#181d27] mb-4">
              تأكيد الحذف
            </h3>
            <p className="text-[#535861] mb-6">
              {deleteConfirmation.hasChildren ? (
                <>
                  هل أنت متأكد من حذف "{deleteConfirmation.entityName}"؟
                  <br />
                  <span className="text-red-600 font-medium mt-2 block">
                    تحذير: سيتم حذف جميع {deleteConfirmation.childrenType}{" "}
                    المرتبطة ({deleteConfirmation.childrenCount} عنصر) أيضاً.
                  </span>
                </>
              ) : (
                <>هل أنت متأكد من حذف "{deleteConfirmation.entityName}"؟</>
              )}
            </p>
            <div className="flex gap-3 justify-start">
              <Button
                type="button"
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                حذف
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelDelete}
                className="px-6 py-2"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageData;
