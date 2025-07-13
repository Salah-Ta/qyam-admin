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
import { MinusCircleIcon, ChevronRightIcon, ArrowLeftIcon } from "lucide-react";

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
      setNewRegions([]);
      setNewEduAdmins({});
      setNewSchools({});
      setDeleteConfirmation(null); // Close delete confirmation on success
      revalidator.revalidate();
    }
  }, [actionData, revalidator]);

  // Helper functions
  const getEduAdminsForRegion = (regionId: string): EntityItem[] => {
    return (
      data.eduAdmins.filter((eduAdmin) => eduAdmin.regionId === regionId) || []
    );
  };

  const getSchoolsForEduAdmin = (eduAdminId: string): EntityItem[] => {
    return (
      data.schools.filter((school) => school.eduAdminId === eduAdminId) || []
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
  const handleDeleteClick = (entityType: string, entityId: string, entityName: string) => {
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
      childrenCount
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('actionType', 'delete');
      formData.append('entityType', deleteConfirmation.entityType);
      formData.append('entityId', deleteConfirmation.entityId);
      
      // Send delete request
      const response = await fetch(window.location.pathname, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        // Revalidate data without page refresh
        revalidator.revalidate();
        setDeleteConfirmation(null);
      } else {
        console.error('Delete failed:', response.statusText);
        // You could add error handling here
      }
    } catch (error) {
      console.error('Delete error:', error);
      // You could add error handling here
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  return (
    <div className="h-full mb-[423px]">
      <div className="w-full h-full bg-white rounded-2xl border border-solid border-[#d0d5dd]">
        <div className="flex flex-col gap-[46px] lg:p-[42px] max-lg:p-[22px] items-start">
          {/* Small Green Button to Add New Region - Left Side */}
          <div className="w-full flex justify-start">
            <Button
              type="button"
              onClick={handleAddNewRegionCard}
              className="h-10 px-4 py-2 bg-[rgb(104,195,92)] hover:bg-[rgb(94,175,82)] text-white font-medium text-sm rounded-lg border-none shadow-md [direction:rtl]"
            >
              إضافة منطقة جديدة
            </Button>
          </div>

          {/* New Region Cards (being created) */}
          {newRegions.map((regionName, index) => (
            <Card
              key={`new-${index}`}
              className="w-full flex flex-col items-center justify-center gap-6 p-4 bg-white rounded-xl border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs"
            >
              <Form method="post" className="w-full">
                <input type="hidden" name="actionType" value="create" />
                <input type="hidden" name="entityType" value="region" />

                <div className="flex w-full h-14 items-center justify-center gap-3 p-5 bg-[#006173] rounded-xl shadow-shadows-shadow-xs">
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      variant="outline"
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
                    >
                      <span className="font-bold text-[#414651] text-sm [direction:rtl]">
                        حفظ
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRemoveNewRegionCard(index)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
                    >
                      <span className="font-bold text-[#414651] text-sm [direction:rtl]">
                        حذف
                      </span>
                    </Button>
                  </div>
                  <div className="flex flex-col items-start gap-0.5 flex-1 grow">
                    <Input
                      className="w-full bg-white border-none shadow-none font-bold text-[#414651] text-base [direction:rtl] placeholder:text-[#717680]"
                      placeholder="اكتب اسم المنطقة"
                      name="itemName"
                      value={regionName}
                      onChange={(e) =>
                        handleNewRegionInputChange(index, e.target.value)
                      }
                    />
                  </div>
                  <div className="relative w-8 h-8 bg-white rounded-md overflow-hidden border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic">
                    <div className="absolute w-4 h-4 top-2 left-2">
                      <img src={UserIcon} alt="" />
                    </div>
                  </div>
                </div>
              </Form>
            </Card>
          ))}

          {/* Existing Regions - Each region gets its own card */}
          {data.regions.map((region) => (
            <Card
              key={region.id}
              className="w-full flex flex-col items-center justify-center gap-6 p-4 bg-white rounded-xl border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs"
            >
              <div className="flex w-full h-14 items-center justify-center gap-3 p-5 bg-[#006173] rounded-xl shadow-shadows-shadow-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRegionExpansion(region.id)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <ChevronRightIcon
                      className={`w-4 h-4 transition-transform ${
                        expandedRegions.has(region.id) ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                </div>
                <div className="flex flex-col items-start gap-0.5 flex-1 grow mt-[-4px] mb-[-4px]">
                  <span className="relative self-stretch mt-[-1px] font-bold text-white text-base tracking-[0] leading-6 [direction:rtl]">
                    {region.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteClick("region", region.id, region.name)}
                  >
                    <MinusCircleIcon className="w-4 h-4 cursor-pointer text-white hover:text-red-300 transition-colors" />
                  </button>
                  <div className="relative w-8 h-8 mt-[-8px] mb-[-8px] bg-white rounded-md overflow-hidden border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic max-md:hidden">
                    <div className="absolute w-4 h-4 top-2 left-2">
                      <img src={UserIcon} alt="" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Region Content - EduAdmins */}
              {expandedRegions.has(region.id) && (
                <CardContent className="p-0 w-full mt-3">
                  <div className="space-y-3">
                    {/* Add EduAdmin Form - Only show if there are inputs */}
                    {newEduAdmins[region.id] &&
                    newEduAdmins[region.id].length > 0 ? (
                      <Form method="post">
                        <input type="hidden" name="actionType" value="create" />
                        <input
                          type="hidden"
                          name="entityType"
                          value="eduAdmin"
                        />
                        <input
                          type="hidden"
                          name="parentId"
                          value={region.id}
                        />

                        <div className="bg-[#f8f9fa] p-3 rounded-lg border border-[#e9ecef]">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium text-[#495057] [direction:rtl]">
                              إضافة إدارة تعليمية
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddEduAdminInput(region.id)}
                              className="ml-auto"
                            >
                              <img
                                src={plusImg}
                                alt="plus"
                                className="w-3 h-3"
                              />
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              className="bg-[#006173] hover:bg-[#004a5a]"
                            >
                              حفظ
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {newEduAdmins[region.id].map((eduAdmin, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  className="flex-1 text-sm [direction:rtl]"
                                  placeholder="اكتب اسم الإدارة التعليمية"
                                  name="itemName"
                                  value={eduAdmin}
                                  onChange={(e) =>
                                    handleEduAdminInputChange(
                                      region.id,
                                      index,
                                      e.target.value
                                    )
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveEduAdminInput(region.id, index)
                                  }
                                >
                                  <MinusCircleIcon className="w-4 h-4 text-[#A4A7AE]" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Form>
                    ) : (
                      <div className="bg-[#f8f9fa] p-3 rounded-lg border border-[#e9ecef]">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#495057] [direction:rtl]">
                            إضافة إدارة تعليمية
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddEduAdminInput(region.id)}
                            className="ml-auto"
                          >
                            <img src={plusImg} alt="plus" className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Existing EduAdmins */}
                    {getEduAdminsForRegion(region.id).map((eduAdmin) => (
                      <div key={eduAdmin.id} className="space-y-2">
                        {/* EduAdmin Header */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#f8f9fa] rounded-md border border-[#e9ecef]">
                          <div className="flex-1 text-sm font-medium text-[#495057] [direction:rtl]">
                            {eduAdmin.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleEduAdminExpansion(eduAdmin.id)
                              }
                              className="text-[#006173] hover:text-[#004a5a] transition-colors"
                            >
                              <ChevronRightIcon
                                className={`w-4 h-4 transition-transform ${
                                  expandedEduAdmins.has(eduAdmin.id)
                                    ? "rotate-90"
                                    : ""
                                }`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteClick("eduAdmin", eduAdmin.id, eduAdmin.name)
                              }
                            >
                              <MinusCircleIcon className="w-4 h-4 cursor-pointer text-[#A4A7AE] hover:text-red-500 transition-colors" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded EduAdmin Content - Schools */}
                        {expandedEduAdmins.has(eduAdmin.id) && (
                          <div className="mr-6 space-y-2">
                            {/* Add School Form - Only show if there are inputs */}
                            {newSchools[eduAdmin.id] &&
                            newSchools[eduAdmin.id].length > 0 ? (
                              <Form method="post">
                                <input
                                  type="hidden"
                                  name="actionType"
                                  value="create"
                                />
                                <input
                                  type="hidden"
                                  name="entityType"
                                  value="school"
                                />
                                <input
                                  type="hidden"
                                  name="parentId"
                                  value={eduAdmin.id}
                                />

                                <div className="bg-[#f1f3f4] p-3 rounded-lg border border-[#dee2e6]">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-medium text-[#6c757d] [direction:rtl]">
                                      إضافة مدرسة
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleAddSchoolInput(eduAdmin.id)
                                      }
                                      className="ml-auto"
                                    >
                                      <img
                                        src={plusImg}
                                        alt="plus"
                                        className="w-3 h-3"
                                      />
                                    </Button>
                                    <Button
                                      type="submit"
                                      size="sm"
                                      className="bg-[#006173] hover:bg-[#004a5a]"
                                    >
                                      حفظ
                                    </Button>
                                  </div>

                                  <div className="space-y-2">
                                    {newSchools[eduAdmin.id].map(
                                      (school, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2"
                                        >
                                          <Input
                                            className="flex-1 text-xs [direction:rtl]"
                                            placeholder="اكتب اسم المدرسة"
                                            name="itemName"
                                            value={school}
                                            onChange={(e) =>
                                              handleSchoolInputChange(
                                                eduAdmin.id,
                                                index,
                                                e.target.value
                                              )
                                            }
                                          />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveSchoolInput(
                                                eduAdmin.id,
                                                index
                                              )
                                            }
                                          >
                                            <MinusCircleIcon className="w-3 h-3 text-[#A4A7AE]" />
                                          </button>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </Form>
                            ) : (
                              <div className="bg-[#f1f3f4] p-3 rounded-lg border border-[#dee2e6]">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-[#6c757d] [direction:rtl]">
                                    إضافة مدرسة
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleAddSchoolInput(eduAdmin.id)
                                    }
                                    className="ml-auto"
                                  >
                                    <img
                                      src={plusImg}
                                      alt="plus"
                                      className="w-3 h-3"
                                    />
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Existing Schools */}
                            {getSchoolsForEduAdmin(eduAdmin.id).map(
                              (school) => (
                                <div
                                  key={school.id}
                                  className="flex items-center gap-2 px-2 py-1 bg-[#f1f3f4] rounded border border-[#dee2e6]"
                                >
                                  <div className="flex-1 text-xs text-[#6c757d] [direction:rtl]">
                                    {school.name}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteClick("school", school.id, school.name)
                                    }
                                  >
                                    <MinusCircleIcon className="w-3 h-3 cursor-pointer text-[#A4A7AE] hover:text-red-500 transition-colors" />
                                  </button>
                                </div>
                              )
                            )}

                            {getSchoolsForEduAdmin(eduAdmin.id).length ===
                              0 && (
                              <div className="text-center text-[#6c757d] text-xs py-2 [direction:rtl]">
                                لا توجد مدارس
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {getEduAdminsForRegion(region.id).length === 0 && (
                      <div className="text-center text-[#6c757d] text-sm py-4 [direction:rtl]">
                        لا توجد إدارات تعليمية
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {data.regions.length === 0 && (
            <div className="text-center text-[#717680] py-8 [direction:rtl]">
              لا توجد مناطق متاحة
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
                      تحذير: سيتم حذف جميع {deleteConfirmation.childrenType} المرتبطة 
                      ({deleteConfirmation.childrenCount} عنصر) أيضاً.
                    </span>
                  </>
                ) : (
                  <>
                    هل أنت متأكد من حذف "{deleteConfirmation.entityName}"؟
                  </>
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
