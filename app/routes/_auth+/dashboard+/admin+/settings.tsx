import React, { useEffect, useState } from "react";
import UserIcon from "../../../../assets/icons/user-modified.svg";
import { json } from "@remix-run/cloudflare";
import {
  useLoaderData,
  useActionData,
  Form,
  useRevalidator,
} from "@remix-run/react";
import schoolDB from "~/db/school/school.server";
import eduAdminDB from "~/db/eduAdmin/eduAdmin.server";
import regionDB from "~/db/region/region.server";
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

    return json({
      regions: regions.data || [],
      eduAdmins: eduAdmins.data || [],
      schools: schools.data || [],
    });
  } catch (error) {
    console.error("Error loading settings data:", error);
    return json({
      regions: [],
      eduAdmins: [],
      schools: [],
    });
  }
}

export const action = async ({ request, context }: LoaderFunctionArgs) => {
  const requestTimestamp = Date.now();
  console.log(`🔥 [${requestTimestamp}] Action called - New request received`);
  
  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const entityType = formData.get("entityType");
  const entityId = formData.get("entityId");
  const names = formData.getAll("itemName");
  const parentId = formData.get("parentId");
  const submissionId = formData.get("submissionId");
  
  console.log(`📋 [${requestTimestamp}] Action params:`, { actionType, entityType, entityId, parentId, submissionId });

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
          return json(
            { status: "error", message: "Invalid entity type" },
            { status: 400 }
          );
      }

      return json({ status: "success", message: "تم الحذف بنجاح" });
    }


    // Handle create action
    if (actionType === "create") {
      console.log("Creating", entityType, "with parentId:", parentId);
      let results = [];
      for (const name of names) {
        if (typeof name === "string" && name.trim() !== "") {
          let result;
          switch (entityType) {
            case "region":
              result = await regionDB.createRegion(name.trim(), dbUrl);
              break;
            case "eduAdmin":
              // Pass the selected region's ID as regionId
              console.log("Creating eduAdmin with regionId:", parentId);
              result = await eduAdminDB.createEduAdmin(
                name.trim(),
                dbUrl,
                parentId as string
              );
              break;
            case "school":
              // Pass the selected eduAdmin's ID as eduAdminId
              console.log("Creating school with eduAdminId:", parentId);
              result = await schoolDB.createSchool(
                name.trim(),
                "",
                dbUrl,
                parentId as string
              );
              break;
            default:
              return json(
                { status: "error", message: "Invalid entity type" },
                { status: 400 }
              );
          }
          results.push(result);
        }
      }

      return json({ 
        status: "success", 
        message: "تم الإنشاء بنجاح", 
        results,
        createdEntityType: entityType,
        createdParentId: parentId
      });
    }

    // Handle batch save action with proper hierarchical transaction support
    if (actionType === "batchSave") {
      console.log("=== BATCH SAVE DEBUG ===");
      console.log("Entity Type:", entityType);
      console.log("Entity ID:", entityId);
      console.log("Names:", names);
      console.log("All form data:");
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      console.log("========================");
      
      let results = [];
      
      // Import database client for transaction
      const { client } = await import("~/db/db-client.server");
      const prisma = await client(dbUrl);
      
      try {
        // Start transaction for atomic hierarchical operations
        await prisma.$transaction(async (tx) => {
          
          if (entityType === "region") {
            // REGION BATCH SAVE: Sequential Processing - Region → EduAdmin1 + Schools → EduAdmin2 + Schools...
            console.log(`🏛️ [${requestTimestamp}] Processing region batch save with sequential eduAdmin+schools creation`);
            
            // Step 1: Update the region name if provided
            if (names.length > 0 && typeof names[0] === "string" && names[0].trim() !== "") {
              const updateResult = await regionDB.updateRegion(entityId as string, names[0].trim(), dbUrl);
              results.push(updateResult);
              console.log("✅ Updated region:", names[0].trim());
            }

            // Step 2: Get all data for processing
            const newEduAdminsData = formData.getAll("newEduAdmins");
            const newSchoolsData = formData.getAll("newSchools");
            const newSchoolsForNewEduAdminsData = formData.getAll("newSchoolsForNewEduAdmins");

            console.log("📊 Data summary:");
            console.log("  - New eduAdmins:", newEduAdminsData.length);
            console.log("  - Schools for existing eduAdmins:", newSchoolsData.length);
            console.log("  - Schools for new eduAdmins:", newSchoolsForNewEduAdminsData.length);
            
            // Debug: Log the actual data being processed
            console.log("📋 New EduAdmins Data:", newEduAdminsData.map(data => {
              try {
                return JSON.parse(data as string);
              } catch (e) {
                return data;
              }
            }));
            
            console.log("📋 New Schools Data:", newSchoolsData.map(data => {
              try {
                return JSON.parse(data as string);
              } catch (e) {
                return data;
              }
            }));
            
            console.log("📋 New Schools For New EduAdmins Data:", newSchoolsForNewEduAdminsData.map(data => {
              try {
                return JSON.parse(data as string);
              } catch (e) {
                return data;
              }
            }));

            // Step 3: Process existing eduAdmins and their schools first
            // Get existing eduAdmins from database for this region
            const existingEduAdminsResult = await eduAdminDB.getAllEduAdmins(dbUrl);
            const existingEduAdmins = existingEduAdminsResult.status === "success" 
              ? existingEduAdminsResult.data.filter(ea => ea.regionId === entityId)
              : [];
            console.log("📋 Processing", existingEduAdmins.length, "existing eduAdmins:");
            console.log("📋 Existing EduAdmins in DB:", existingEduAdmins.map(ea => ({ id: ea.id, name: ea.name })));
            
            for (const eduAdmin of existingEduAdmins) {
              console.log(`\n🏢 Processing existing eduAdmin: ${eduAdmin.name} (ID: ${eduAdmin.id})`);
              
              // Find and create schools for this existing eduAdmin
              const schoolsForThisEduAdmin = [];
              for (const schoolData of newSchoolsData) {
                try {
                  const parsedSchool = JSON.parse(schoolData as string);
                  if (parsedSchool.name && parsedSchool.eduAdminId === eduAdmin.id) {
                    schoolsForThisEduAdmin.push(parsedSchool);
                  }
                } catch (error) {
                  console.error("Error parsing school data:", error);
                }
              }

              console.log(`  📚 Creating ${schoolsForThisEduAdmin.length} schools for eduAdmin: ${eduAdmin.name}`);
              for (const school of schoolsForThisEduAdmin) {
                console.log(`    ➕ Checking if school exists: ${school.name}`);
                
                // Check if school already exists for this eduAdmin
                const existsResult = await schoolDB.checkSchoolExists(
                  school.name,
                  eduAdmin.id,
                  dbUrl
                );
                
                if (existsResult.status === "success" && existsResult.data.exists) {
                  console.log(`    ⚠️ School already exists, skipping: ${school.name} → eduAdmin: ${eduAdmin.name}`);
                  continue;
                }
                
                console.log(`    ➕ Creating new school: ${school.name}`);
                const result = await schoolDB.createSchool(
                  school.name,
                  "",
                  dbUrl,
                  eduAdmin.id
                );
                
                results.push(result);
                console.log(`    ✅ Created school: ${school.name} → eduAdmin: ${eduAdmin.name}`);
              }
            }

            // Step 4: Process new eduAdmins and their schools sequentially
            console.log(`\n📋 Processing ${newEduAdminsData.length} new eduAdmins:`);
            
            for (let i = 0; i < newEduAdminsData.length; i++) {
              const eduAdminData = newEduAdminsData[i];
              try {
                const parsedEduAdmin = JSON.parse(eduAdminData as string);
                if (parsedEduAdmin.name && parsedEduAdmin.regionId) {
                  console.log(`\n🏢 Checking if eduAdmin exists: ${parsedEduAdmin.name}`);
                  
                  // Check if eduAdmin already exists for this region
                  const existsResult = await eduAdminDB.checkEduAdminExists(
                    parsedEduAdmin.name,
                    parsedEduAdmin.regionId,
                    dbUrl
                  );
                  
                  let newEduAdminId;
                  if (existsResult.status === "success" && existsResult.data.exists) {
                    console.log(`  ⚠️ EduAdmin already exists, using existing: ${parsedEduAdmin.name}`);
                    newEduAdminId = existsResult.data.eduAdmin!.id;
                  } else {
                    console.log(`  ➕ Creating new eduAdmin ${i + 1}: ${parsedEduAdmin.name}`);
                    
                    // Create the eduAdmin first
                    const eduAdminResult = await eduAdminDB.createEduAdmin(
                      parsedEduAdmin.name,
                      dbUrl,
                      parsedEduAdmin.regionId  // Assign to parent region
                    );
                    
                    results.push(eduAdminResult);
                    newEduAdminId = eduAdminResult.data.id;
                    console.log(`    ✅ Created eduAdmin: ${parsedEduAdmin.name} → region: ${entityId} (ID: ${newEduAdminId})`);
                  }
                  
                  // Now create schools for this newly created eduAdmin
                  const schoolsForThisNewEduAdmin = [];
                  for (const schoolData of newSchoolsForNewEduAdminsData) {
                    try {
                      const parsedSchool = JSON.parse(schoolData as string);
                      if (parsedSchool.name && parsedSchool.newEduAdminIndex === i) {
                        schoolsForThisNewEduAdmin.push(parsedSchool);
                      }
                    } catch (error) {
                      console.error("Error parsing school data for new eduAdmin:", error);
                    }
                  }

                  console.log(`  📚 Creating ${schoolsForThisNewEduAdmin.length} schools for eduAdmin: ${parsedEduAdmin.name}`);
                  for (const school of schoolsForThisNewEduAdmin) {
                    console.log(`    ➕ Checking if school exists: ${school.name}`);
                    
                    // Check if school already exists for this eduAdmin
                    const schoolExistsResult = await schoolDB.checkSchoolExists(
                      school.name,
                      newEduAdminId,
                      dbUrl
                    );
                    
                    if (schoolExistsResult.status === "success" && schoolExistsResult.data.exists) {
                      console.log(`    ⚠️ School already exists, skipping: ${school.name} → eduAdmin: ${parsedEduAdmin.name}`);
                      continue;
                    }
                    
                    console.log(`    ➕ Creating new school: ${school.name}`);
                    const schoolResult = await schoolDB.createSchool(
                      school.name,
                      "",
                      dbUrl,
                      newEduAdminId  // Assign to parent eduAdmin
                    );
                    
                    results.push(schoolResult);
                    console.log(`    ✅ Created school: ${school.name} → eduAdmin: ${parsedEduAdmin.name}`);
                  }
                }
              } catch (error) {
                console.error("Error processing eduAdmin:", error);
                throw new Error(`Failed to process eduAdmin ${i + 1}: ${error.message}`);
              }
            }

            console.log("\n🎉 Region batch save completed successfully!");

          } else if (entityType === "eduAdmin") {
            // EDUADMIN BATCH SAVE: EduAdmin → Schools inside it
            console.log("Processing eduAdmin batch save");
            
            // Step 1: Update the eduAdmin name if provided
            if (names.length > 0 && typeof names[0] === "string" && names[0].trim() !== "") {
              const updateResult = await eduAdminDB.updateEduAdmin(entityId as string, names[0].trim(), dbUrl);
              results.push(updateResult);
              console.log("Updated eduAdmin:", names[0].trim());
            }

            // Step 2: Create all new schools for this eduAdmin
            const newSchoolsData = formData.getAll("newSchools");
            console.log("EduAdmin batch save - Found newSchools data:", newSchoolsData.length, "entries");
            for (const schoolData of newSchoolsData) {
              try {
                const parsedSchool = JSON.parse(schoolData as string);
                console.log("Processing school data:", parsedSchool, "for entityId:", entityId);
                
                if (parsedSchool.name && parsedSchool.eduAdminId && String(parsedSchool.eduAdminId) === String(entityId)) {
                  console.log(`Checking if school exists: ${parsedSchool.name} for eduAdmin: ${entityId}`);
                  
                  // Check if school already exists for this eduAdmin
                  const existsResult = await schoolDB.checkSchoolExists(
                    parsedSchool.name,
                    parsedSchool.eduAdminId,
                    dbUrl
                  );
                  
                  if (existsResult.status === "success" && existsResult.data.exists) {
                    console.log(`School already exists, skipping: ${parsedSchool.name} for eduAdmin: ${entityId}`);
                    continue;
                  }
                  
                  console.log(`Creating new school: ${parsedSchool.name} for eduAdmin: ${entityId}`);
                  const result = await schoolDB.createSchool(
                    parsedSchool.name,
                    "",
                    dbUrl,
                    parsedSchool.eduAdminId
                  );
                  
                  results.push(result);
                  console.log(`Created school: ${parsedSchool.name}`);
                } else {
                  console.log("School filtered out:", {
                    name: parsedSchool.name,
                    eduAdminId: parsedSchool.eduAdminId,
                    entityId: entityId,
                    match: String(parsedSchool.eduAdminId) === String(entityId)
                  });
                }
              } catch (error) {
                console.error("Error parsing school data:", error);
                throw new Error(`Failed to process school: ${error.message}`);
              }
            }

          } else {
            throw new Error("Invalid entity type for batch save");
          }
        });

        // Transaction completed successfully
        await prisma.$disconnect();
        
        console.log("Batch save completed successfully. Results:", results.length);
        
        return json({ 
          status: "success", 
          message: "تم الحفظ بنجاح", 
          results,
          savedEntityType: entityType,
          savedEntityId: entityId
        });
      } catch (transactionError) {
        console.error("Transaction failed:", transactionError);
        await prisma.$disconnect();
        throw transactionError; // Re-throw to be caught by outer catch block
      }
    }

    return json(
      { status: "error", message: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Action error:", error);
    
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
    
    return json({ 
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

  console.log("Loader data:", data);

  const actionData = useActionData() as
    | {
        status: string;
        message?: string;
        results?: any[];
        createdEntityType?: string;
        createdParentId?: string;
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
      console.warn("Failed to load state from localStorage:", error);
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.newRegions, JSON.stringify(newRegions));
    } catch (error) {
      console.warn("Failed to save newRegions to localStorage:", error);
    }
  }, [newRegions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.newEduAdmins, JSON.stringify(newEduAdmins));
    } catch (error) {
      console.warn("Failed to save newEduAdmins to localStorage:", error);
    }
  }, [newEduAdmins]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.newSchools, JSON.stringify(newSchools));
    } catch (error) {
      console.warn("Failed to save newSchools to localStorage:", error);
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
      console.warn("Failed to clear localStorage:", error);
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
        setNewEduAdmins(prev => ({
          ...prev,
          [actionData.createdParentId]: []
        }));
        clearStorageForEntity("eduAdmin", actionData.createdParentId);
      } else if (actionData.createdEntityType === "school" && actionData.createdParentId) {
        // Only clear schools for the specific eduAdmin
        setNewSchools(prev => ({
          ...prev,
          [actionData.createdParentId]: []
        }));
        clearStorageForEntity("school", actionData.createdParentId);
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
          console.log("Cleared state for region batch save:", savedEntityId);
          
        } else if (savedEntityType === "eduAdmin") {
          // EduAdmin batch save completed - clear schools for this eduAdmin
          setNewSchools(prev => ({
            ...prev,
            [savedEntityId]: []
          }));
          
          clearStorageForEntity("eduAdmin", savedEntityId);
          console.log("Cleared state for eduAdmin batch save:", savedEntityId);
        }
      }

      setDeleteConfirmation(null); // Close delete confirmation on success
      
      // Revalidate to get updated data
      revalidator.revalidate();
      
      // Auto-add empty inputs based on what was just created
      if (actionData.createdEntityType && actionData.results && actionData.results.length > 0) {
        // Increased timeout to ensure revalidation completes first
        setTimeout(() => {
          if (actionData.createdEntityType === "region") {
            // When a region is created, auto-add empty eduAdmin input
            const newRegionResult = actionData.results[0];
            if (newRegionResult?.success && newRegionResult.data?.id) {
              setNewEduAdmins(prev => ({
                ...prev,
                [newRegionResult.data.id]: [""]
              }));
            }
          } else if (actionData.createdEntityType === "eduAdmin" && actionData.createdParentId) {
            // When an eduAdmin is created, auto-add empty school input
            const newEduAdminResult = actionData.results[0];
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
        console.error("Delete failed:", response.statusText);
        // You could add error handling here
      }
    } catch (error) {
      console.error("Delete error:", error);
      // You could add error handling here
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Enhanced save handler that captures all visible input data
  const handleSaveClick = (formId: string, buttonElement: HTMLButtonElement) => {
    // Check if this form is already submitting or has an active debounce timer
    if (loadingStates[formId] || debounceTimers[formId]) {
      console.log("Save blocked - form is submitting or debounced:", formId);
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
    }, 2000); // Increased to 2 seconds for better protection

    setDebounceTimers(prev => ({ ...prev, [formId]: timer }));

    // Find the form and inject missing data before submission
    const form = buttonElement.closest('form');
    if (form) {
      // Add a unique submission ID to track this specific submission
      const submissionId = Date.now();
      const hiddenSubmissionId = document.createElement('input');
      hiddenSubmissionId.type = 'hidden';
      hiddenSubmissionId.name = 'submissionId';
      hiddenSubmissionId.value = submissionId.toString();
      hiddenSubmissionId.setAttribute('data-dynamic', 'true');
      form.appendChild(hiddenSubmissionId);
      console.log(`📤 [${submissionId}] Submitting form: ${formId}`);
      
      // For region forms, inject all current input values as hidden fields
      if (formId.startsWith('region-')) {
        const regionId = formId.replace('region-', '');
        injectRegionHierarchyData(form, regionId);
      }
      
      // Let Remix handle the form submission
      form.requestSubmit();
    }
  };

  // Function to inject all current input values into the form
  const injectRegionHierarchyData = (form: HTMLFormElement, regionId: string) => {
    const timestamp = Date.now();
    console.log(`🔄 [${timestamp}] Injecting hierarchy data for region:`, regionId);
    
    // Remove any existing dynamic hidden inputs to avoid duplicates
    const existingInputs = form.querySelectorAll('input[data-dynamic="true"]');
    console.log(`🗑️ [${timestamp}] Removing ${existingInputs.length} existing dynamic inputs`);
    existingInputs.forEach(input => input.remove());

    // Inject new eduAdmin data from visible inputs
    const eduAdminInputs = document.querySelectorAll(`input[data-eduadmin-region="${regionId}"]`);
    console.log(`📊 [${timestamp}] Found ${eduAdminInputs.length} eduAdmin inputs for region ${regionId}`);
    
    eduAdminInputs.forEach((input: HTMLInputElement, index) => {
      if (input.value.trim()) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'newEduAdmins';
        hiddenInput.value = JSON.stringify({ name: input.value.trim(), regionId: regionId });
        hiddenInput.setAttribute('data-dynamic', 'true');
        hiddenInput.setAttribute('data-timestamp', timestamp.toString());
        form.appendChild(hiddenInput);
        console.log(`➕ [${timestamp}] Injected eduAdmin ${index + 1}:`, input.value.trim());
      }
    });

    // Inject school data from visible inputs
    const schoolInputs = document.querySelectorAll(`input[data-school-region="${regionId}"]`);
    console.log(`🏫 [${timestamp}] Found ${schoolInputs.length} school inputs for region ${regionId}`);
    
    schoolInputs.forEach((input: HTMLInputElement) => {
      if (input.value.trim()) {
        const eduAdminId = input.getAttribute('data-eduadmin-id');
        const newEduAdminIndex = input.getAttribute('data-new-eduadmin-index');
        
        if (eduAdminId && eduAdminId !== 'null') {
          // School for existing eduAdmin
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = 'newSchools';
          hiddenInput.value = JSON.stringify({ name: input.value.trim(), eduAdminId: eduAdminId });
          hiddenInput.setAttribute('data-dynamic', 'true');
          hiddenInput.setAttribute('data-timestamp', timestamp.toString());
          form.appendChild(hiddenInput);
          console.log(`🏫 [${timestamp}] Injected school for existing eduAdmin:`, input.value.trim(), 'eduAdminId:', eduAdminId);
        } else if (newEduAdminIndex && newEduAdminIndex !== 'null') {
          // School for new eduAdmin
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = 'newSchoolsForNewEduAdmins';
          hiddenInput.value = JSON.stringify({ 
            name: input.value.trim(), 
            newEduAdminIndex: parseInt(newEduAdminIndex),
            regionId: regionId 
          });
          hiddenInput.setAttribute('data-dynamic', 'true');
          hiddenInput.setAttribute('data-timestamp', timestamp.toString());
          form.appendChild(hiddenInput);
          console.log(`🏫 [${timestamp}] Injected school for new eduAdmin:`, input.value.trim(), 'eduAdminIndex:', newEduAdminIndex);
        } else {
          console.warn('School input found but no valid parent identified:', {
            value: input.value.trim(),
            eduAdminId: eduAdminId,
            newEduAdminIndex: newEduAdminIndex,
            input: input
          });
        }
      }
    });
  };

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
    <div className="h-full mb-[423px]">
      {/* Global Error Display */}
      {errors.general && (
        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4 [direction:rtl]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="mr-3">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          </div>
        </div>
      )}


      {/* Single Region Add Section - As shown in image.png */}
      <div className="w-full bg-white rounded-2xl border border-solid border-[#d0d5dd] mt-8">
        <div className="p-6">
          <Form method="post" className="space-y-4">
            <input type="hidden" name="actionType" value="create" />
            <input type="hidden" name="entityType" value="region" />

            {/* Header Section - Teal background with save button and title */}
            <div className="flex w-full h-14 items-center justify-between gap-3 p-5 bg-[#006173] rounded-xl shadow-shadows-shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={loadingStates["new-region-form"] || validationErrors["new-region-input"]}
                  onClick={(e) => !loadingStates["new-region-form"] && !validationErrors["new-region-input"] && handleSaveClick("new-region-form", e.currentTarget)}
                  className="py-1.5 px-8 bg-white border border-[#D5D7DA] rounded-lg text-[#535861] font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingStates["new-region-form"] ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 bg-white rounded-md overflow-hidden border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic">
                  <div className="absolute w-4 h-4 top-2 left-2">
                    <img src={UserIcon} alt="" />
                  </div>
                </div>
                <span className="font-bold text-white text-base tracking-[0] leading-6">
                  منطقة الرياض
                </span>
              </div>
            </div>

            {/* Input Section */}
            <div className="space-y-3">
              <div className="flex justify-end">
                <label className="text-[#535861] font-medium text-sm">
                  المنطقة <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex [direction:rtl]">
                <input
                  type="text"
                  name="itemName"
                  placeholder="اكتب المنطقة المراد اضافتها"
                  className={`flex-1 px-4 py-3 bg-white border rounded-lg text-right text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:border-transparent ${
                    validationErrors["new-region-input"] 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-[#D5D7DA] focus:ring-[#17b169]"
                  }`}
                  onChange={(e) => handleRegionNameChange(e.target.value, "new-region-input")}
                  required
                />
              </div>
              
              {/* Validation Error for new region input */}
              {validationErrors["new-region-input"] && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 [direction:rtl]">
                  <p className="text-xs text-red-600">{validationErrors["new-region-input"]}</p>
                </div>
              )}
              
              {/* Error Display for new region form */}
              {errors["new-region-form"] && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 [direction:rtl]">
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

                  {/* Include all new eduAdmins for this region */}
                  {newEduAdmins[region.id] && newEduAdmins[region.id].map((eduAdminName, index) => (
                    eduAdminName.trim() && (
                      <input
                        key={index}
                        type="hidden"
                        name="newEduAdmins"
                        value={JSON.stringify({ name: eduAdminName.trim(), regionId: region.id })}
                      />
                    )
                  ))}

                  {/* Include all new schools for existing eduAdmins in this region */}
                  {getEduAdminsForRegion(region.id).map((eduAdmin) => (
                    newSchools[eduAdmin.id] && newSchools[eduAdmin.id].map((schoolName, index) => (
                      schoolName.trim() && (
                        <input
                          key={`${eduAdmin.id}-${index}`}
                          type="hidden"
                          name="newSchools"
                          value={JSON.stringify({ name: schoolName.trim(), eduAdminId: eduAdmin.id })}
                        />
                      )
                    ))
                  ))}

                  {/* Include all new schools for new eduAdmins in this region */}
                  {newEduAdmins[region.id] && newEduAdmins[region.id].map((eduAdminName, eduAdminIndex) => (
                    newSchools[`new-eduadmin-${region.id}-${eduAdminIndex}`] && 
                    newSchools[`new-eduadmin-${region.id}-${eduAdminIndex}`].map((schoolName, schoolIndex) => (
                      schoolName.trim() && (
                        <input
                          key={`new-${region.id}-${eduAdminIndex}-${schoolIndex}`}
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

                  <div className="flex items-center justify-between mb-6">
                    <button
                      type="button"
                      disabled={loadingStates[`region-${region.id}`] || hasRegionHierarchyErrors(region.id)}
                      onClick={(e) => !loadingStates[`region-${region.id}`] && !hasRegionHierarchyErrors(region.id) && handleSaveClick(`region-${region.id}`, e.currentTarget)}
                      className="px-6 py-3 bg-[#F8F9FA] border border-[#D5D7DA] rounded-lg text-[#535861] font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={hasRegionHierarchyErrors(region.id) ? "يرجى إصلاح الأخطاء في الحقول قبل الحفظ" : "حفظ المنطقة وجميع الإدارات والمدارس"}
                    >
                      {loadingStates[`region-${region.id}`] ? "جاري الحفظ..." : "حفظ الكل"}
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteClick("region", region.id, region.name)}
                        className="w-6 h-6 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <XIcon className="w-4 h-4 text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddEduAdminInput(region.id)}
                        className="w-6 h-6 bg-[#17b169] rounded flex items-center justify-center hover:bg-[#15a062] transition-colors"
                      >
                        <span className="text-white text-sm font-bold">+</span>
                      </button>
                      <h3 className="text-lg font-bold text-[#181d27]">{region.name}</h3>
                    </div>
                  </div>

                  <div className="flex [direction:rtl]">
                    <input
                      type="text"
                      name="itemName"
                      defaultValue={region.name}
                      placeholder="اكتب اسم المنطقة المراد اضافتها"
                      className={`flex-1 px-4 py-3 bg-white border rounded-lg text-right text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:border-transparent ${
                        validationErrors[`region-${region.id}-input`] 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-[#D5D7DA] focus:ring-[#17b169]"
                      }`}
                      onChange={(e) => handleRegionNameChange(e.target.value, `region-${region.id}-input`)}
                      required
                    />
                  </div>
                  
                  {/* Validation Error for region input */}
                  {validationErrors[`region-${region.id}-input`] && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 [direction:rtl]">
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

                      <div className="flex items-center justify-end mb-6">
                        <div className="flex items-center gap-3">
                     
                          <div className="w-6 h-6 bg-[#17b169] rounded flex items-center justify-center">
                            <span className="text-white text-sm font-bold">+</span>
                          </div>
                          <h3 className="text-lg font-bold text-[#181d27]">إدارة جديدة</h3>
                        </div>
                      </div>

                      <div className="flex [direction:rtl]">
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
                          className={`flex-1 px-4 py-3 bg-white border rounded-lg text-right text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:border-transparent ${
                            validationErrors[`new-eduadmin-${region.id}-${index}`] 
                              ? "border-red-500 focus:ring-red-500" 
                              : "border-[#D5D7DA] focus:ring-[#17b169]"
                          }`}
                          required
                        />
                      </div>
                      
                      {/* Validation Error for new eduAdmin input */}
                      {validationErrors[`new-eduadmin-${region.id}-${index}`] && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 [direction:rtl] mt-2">
                          <p className="text-xs text-red-600">{validationErrors[`new-eduadmin-${region.id}-${index}`]}</p>
                        </div>
                      )}
                    </Form>

                    {/* Schools section for new eduAdmin */}
                    <div className="pr-8">
                      <div className="flex items-center justify-between mb-6">
                        <div></div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleAddSchoolInput(`new-eduadmin-${region.id}-${index}`)}
                            className="w-6 h-6 bg-[#17b169] rounded flex items-center justify-center hover:bg-[#15a062] transition-colors"
                          >
                            <span className="text-white text-sm font-bold">+</span>
                          </button>
                          <h3 className="text-lg font-bold text-[#181d27]">المدارس</h3>
                        </div>
                      </div>

                      {/* New Schools for this new EduAdmin */}
                      {newSchools[`new-eduadmin-${region.id}-${index}`] &&
                      newSchools[`new-eduadmin-${region.id}-${index}`].map((schoolName, schoolIndex) => (
                        <div key={schoolIndex} className="flex items-center gap-2 [direction:rtl] mb-4">
                          <input
                            type="text"
                            value={schoolName}
                            data-school-region={region.id}
                            data-new-eduadmin-index={index}
                            data-school-index={schoolIndex}
                            onChange={(e) => handleSchoolInputChange(`new-eduadmin-${region.id}-${index}`, schoolIndex, e.target.value)}
                            placeholder="اكتب اسم المدرسة المراد اضافتها"
                            className="flex-1 px-4 py-3 bg-white border border-[#D5D7DA] rounded-lg text-right text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#17b169] focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSchoolInput(`new-eduadmin-${region.id}-${index}`, schoolIndex)}
                            className="w-12 h-12 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <XIcon className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
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

                      <div className="flex items-center justify-between mb-6">
                        <div></div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleDeleteClick("eduAdmin", eduAdmin.id, eduAdmin.name)}
                            className="w-6 h-6 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <XIcon className="w-4 h-4 text-white" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddSchoolInput(eduAdmin.id)}
                            className="w-6 h-6 bg-[#17b169] rounded flex items-center justify-center hover:bg-[#15a062] transition-colors"
                          >
                            <span className="text-white text-sm font-bold">+</span>
                          </button>
                          <h3 className="text-lg font-bold text-[#181d27]">{eduAdmin.name}</h3>
                        </div>
                      </div>

                      <div className="flex [direction:rtl]">
                        <input
                          type="text"
                          name="itemName"
                          defaultValue={eduAdmin.name}
                          placeholder="اكتب اسم الإدارة المراد اضافتها"
                          className="flex-1 px-4 py-3 bg-white border border-[#D5D7DA] rounded-lg text-right text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#17b169] focus:border-transparent"
                          required
                        />
                      </div>
                    </Form>

                    {/* Dynamic Schools for this EduAdmin */}
                    <div className="pr-8">
                      <div className="flex items-center justify-between mb-6">
                        <div></div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleAddSchoolInput(eduAdmin.id)}
                            className="w-6 h-6 bg-[#17b169] rounded flex items-center justify-center hover:bg-[#15a062] transition-colors"
                          >
                            <span className="text-white text-sm font-bold">+</span>
                          </button>
                          <h3 className="text-lg font-bold text-[#181d27]">المدارس</h3>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* New School Inputs - Show first */}
                        {newSchools[eduAdmin.id] &&
                        newSchools[eduAdmin.id].map((schoolName, index) => (
                          <div key={index} className="flex items-center gap-2 [direction:rtl]">
                            <input
                              type="text"
                              value={schoolName}
                              data-school-region={region.id}
                              data-eduadmin-id={eduAdmin.id}
                              data-school-index={index}
                              onChange={(e) => handleSchoolInputChange(eduAdmin.id, index, e.target.value)}
                              placeholder="اكتب اسم المدرسة المراد اضافتها"
                              className="flex-1 px-4 py-3 bg-white border border-[#D5D7DA] rounded-lg text-right text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#17b169] focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSchoolInput(eduAdmin.id, index)}
                              className="w-12 h-12 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <XIcon className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}

                        {/* Show existing schools */}
                        {getSchoolsForEduAdmin(eduAdmin.id).map((school) => (
                          <div key={school.id} className="flex items-center gap-2 [direction:rtl]">
                            <input
                              type="text"
                              defaultValue={school.name}
                              className="flex-1 px-4 py-3 bg-gray-100 border border-[#D5D7DA] rounded-lg text-right text-[#535861] placeholder-[#9CA3AF]"
                              readOnly
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteClick("school", school.id, school.name)}
                              className="w-12 h-12 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
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
            <div className="text-center text-[#717680] py-8 [direction:rtl]">
              لا توجد مناطق متاحة - استخدم النموذج أعلاه لإضافة منطقة جديدة
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation?.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 [direction:rtl]">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#414651] mb-2">
                تأكيد الحذف
              </h3>
              <p className="text-[#717680] mb-4">
                {deleteConfirmation.hasChildren ? (
                  <>
                    هل أنت متأكد من حذف "{deleteConfirmation.entityName}"؟
                    <br />
                    <span className="text-red-600 font-medium">
                      تحذير: سيتم حذف جميع {deleteConfirmation.childrenType}{" "}
                      المرتبطة ({deleteConfirmation.childrenCount} عنصر) أيضاً.
                    </span>
                  </>
                ) : (
                  <>هل أنت متأكد من حذف "{deleteConfirmation.entityName}"؟</>
                )}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={cancelDelete}
                className="px-4 py-2"
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageData;
