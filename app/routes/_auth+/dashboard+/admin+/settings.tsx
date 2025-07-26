import React, { useEffect, useState } from "react";
import { Button } from "~/routes/_auth+/new-design/components/ui/button";
import {
  Card,
  CardContent,
} from "~/routes/_auth+/new-design/components/ui/card";
import { Input } from "~/routes/_auth+/new-design/components/ui/input";
import plusImg from "../../../../assets/icons/plus.svg";
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
import { MinusCircleIcon, ChevronRightIcon, ArrowLeftIcon, XIcon } from "lucide-react";

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
  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const entityType = formData.get("entityType");
  const entityId = formData.get("entityId");
  const names = formData.getAll("itemName");
  const parentId = formData.get("parentId");

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

      return json({ status: "success", message: "تم الإنشاء بنجاح", results });
    }

    return json(
      { status: "error", message: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    return json({ status: "error", message: error.message }, { status: 500 });
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

  // Update data when action returns success
  useEffect(() => {
    if (actionData?.status === "success") {
      // Handle different entity creation types
      const formData = new FormData();
      // We need to track what was just created to auto-add children
      
      // Clear current input states
      setNewRegions([]);
      setNewEduAdmins({});
      setNewSchools({});
      setDeleteConfirmation(null); // Close delete confirmation on success
      
      // Revalidate to get updated data
      revalidator.revalidate();
      
      // Auto-add empty inputs after a short delay to allow data to load
      setTimeout(() => {
        // If we have regions and the last one was just created, add empty eduAdmin
        if (safeData.regions && safeData.regions.length > 0) {
          const latestRegion = safeData.regions
            .slice()
            .sort((a, b) => {
              if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              }
              return b.id.localeCompare(a.id, undefined, { numeric: true });
            })[0];
          
          // Add empty eduAdmin input for the latest region
          if (latestRegion) {
            setNewEduAdmins(prev => ({
              ...prev,
              [latestRegion.id]: [""]
            }));
          }
        }
      }, 100);
    }
  }, [actionData, revalidator, safeData.regions]);

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

  return (
    <div className="h-full mb-[423px]">

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
                  type="submit"
                  className="py-1.5 px-8 bg-white border border-[#D5D7DA] rounded-lg text-[#535861] font-medium hover:bg-gray-100 transition-colors"
                >
                  حفظ
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
                  className="flex-1 px-4 py-3 bg-white border border-[#D5D7DA] rounded-lg text-right text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#17b169] focus:border-transparent"
                  required
                />
              </div>
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
                  <input type="hidden" name="actionType" value="update" />
                  <input type="hidden" name="entityType" value="region" />
                  <input type="hidden" name="entityId" value={region.id} />

                  <div className="flex items-center justify-between mb-6">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#F8F9FA] border border-[#D5D7DA] rounded-lg text-[#535861] font-medium hover:bg-gray-100 transition-colors"
                    >
                      حفظ
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
                      className="flex-1 px-4 py-3 bg-white border border-[#D5D7DA] rounded-lg text-right text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#17b169] focus:border-transparent"
                      required
                    />
                  </div>
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

                      <div className="flex items-center justify-between mb-6">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-[#F8F9FA] border border-[#D5D7DA] rounded-lg text-[#535861] font-medium hover:bg-gray-100 transition-colors"
                        >
                          حفظ
                        </button>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveEduAdminInput(region.id, index)}
                            className="w-6 h-6 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <XIcon className="w-4 h-4 text-white" />
                          </button>
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
                          onChange={(e) => handleEduAdminInputChange(region.id, index, e.target.value)}
                          placeholder="اكتب اسم الإدارة المراد اضافتها"
                          className="flex-1 px-4 py-3 bg-white border border-[#D5D7DA] rounded-lg text-right text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#17b169] focus:border-transparent"
                          required
                        />
                      </div>
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
                      <input type="hidden" name="actionType" value="update" />
                      <input type="hidden" name="entityType" value="eduAdmin" />
                      <input type="hidden" name="entityId" value={eduAdmin.id} />
                      <input type="hidden" name="parentId" value={region.id} />

                      <div className="flex items-center justify-between mb-6">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-[#F8F9FA] border border-[#D5D7DA] rounded-lg text-[#535861] font-medium hover:bg-gray-100 transition-colors"
                        >
                          حفظ
                        </button>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleDeleteClick("eduAdmin", eduAdmin.id, eduAdmin.name)}
                            className="w-6 h-6 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <XIcon className="w-4 h-4 text-white" />
                          </button>
                          <div className="w-6 h-6 bg-[#17b169] rounded flex items-center justify-center">
                            <span className="text-white text-sm font-bold">+</span>
                          </div>
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
                          <Form key={index} method="post" className="flex items-center gap-2 [direction:rtl]">
                            <input type="hidden" name="actionType" value="create" />
                            <input type="hidden" name="entityType" value="school" />
                            <input type="hidden" name="parentId" value={eduAdmin.id} />
                            
                            <input
                              type="text"
                              name="itemName"
                              value={schoolName}
                              onChange={(e) => handleSchoolInputChange(eduAdmin.id, index, e.target.value)}
                              placeholder="اكتب اسم المدرسة المراد اضافتها"
                              className="flex-1 px-4 py-3 bg-white border border-[#D5D7DA] rounded-lg text-right text-[#535861] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#17b169] focus:border-transparent"
                            />
                            <button
                              type="submit"
                              className="px-3 py-2 bg-[#17b169] text-white rounded-lg hover:bg-[#15a062] transition-colors"
                            >
                              حفظ
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSchoolInput(eduAdmin.id, index)}
                              className="w-12 h-12 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <XIcon className="w-4 h-4 text-white" />
                            </button>
                          </Form>
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
