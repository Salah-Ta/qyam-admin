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
import { useLoaderData, useActionData, Form, useRevalidator } from "@remix-run/react";
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
      setTimeout(() => reject(new Error('Database operation timeout')), 15000)
    );
    
    const dataPromise = Promise.all([
      regionDB.getAllRegions(dbUrl),
      eduAdminDB.getAllEduAdmins(dbUrl),
      schoolDB.getAllSchools(dbUrl)
    ]);
    
    const [regions, eduAdmins, schools] = await Promise.race([dataPromise, timeoutPromise]) as any[];
    
    return json({ 
      regions: regions.data || [], 
      eduAdmins: eduAdmins.data || [], 
      schools: schools.data || []
    });
  } catch (error) {
    console.error("Error loading settings data:", error);
    return json({ 
      regions: [], 
      eduAdmins: [], 
      schools: [] 
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
          return json({ status: "error", message: "Invalid entity type" }, { status: 400 });
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
              result = await eduAdminDB.createEduAdmin(name.trim(), dbUrl, parentId as string);
              break;
            case "school":
              // Pass the selected eduAdmin's ID as eduAdminId
              console.log("Creating school with eduAdminId:", parentId);
              result = await schoolDB.createSchool(name.trim(), "", dbUrl, parentId as string);
              break;
            default:
              return json({ status: "error", message: "Invalid entity type" }, { status: 400 });
          }
          results.push(result);
        }
      }
      
      return json({ status: "success", message: "تم الإنشاء بنجاح", results });
    }

    return json({ status: "error", message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return json({ status: "error", message: error.message }, { status: 500 });
  }
};

// --- Main Component ---
// This component now implements a hierarchical navigation system:
// 1. Regions: Top level - shows all regions
// 2. EduAdmins: Middle level - shows educational administrations under a selected region
// 3. Schools: Bottom level - shows schools under a selected educational administration

interface EntityItem {
  id: string;
  name: string;
  regionId?: string;    // For eduAdmin items
  eduAdminId?: string;  // For school items
}

interface NavigationState {
  currentView: 'regions' | 'eduAdmins' | 'schools';
  selectedRegion?: EntityItem;
  selectedEduAdmin?: EntityItem;
  breadcrumb: string[];
}

export const ManageData = (): JSX.Element => {
  const data = useLoaderData() as { 
    regions: EntityItem[]; 
    eduAdmins: EntityItem[]; 
    schools: EntityItem[];
  };
  console.log("Loader data:", data);
  
  const actionData = useActionData() as {
    status: string;
    message?: string;
    results?: any[];
  } | undefined;
  
  const revalidator = useRevalidator();
  
  const [navigation, setNavigation] = useState<NavigationState>({
    currentView: 'regions',
    breadcrumb: ['المناطق']
  });
  
  const [newItems, setNewItems] = useState<string[]>([""]);

  // Update data when action returns success - trigger revalidation to refresh data
  useEffect(() => {
    if (actionData?.status === 'success') {
      // Clear new items after successful submission
      setNewItems([""]);
      // Revalidate to refresh data from server
      revalidator.revalidate();
    }
  }, [actionData, revalidator]);

  const getCurrentItems = (): EntityItem[] => {
    // Always use the original loader data, since action no longer returns updated data
    switch (navigation.currentView) {
      case 'regions':
        return data.regions || [];
      case 'eduAdmins':
        // Filter eduAdmins by selected region
        console.log("Selected region:", navigation.selectedRegion);
        console.log("All eduAdmins:", data.eduAdmins);
        return data.eduAdmins.filter((eduAdmin: any) => {
          console.log("EduAdmin:", eduAdmin.name, "regionId:", eduAdmin.regionId);
          return eduAdmin.regionId === navigation.selectedRegion?.id;
        }) || [];
      case 'schools':
        // Filter schools by selected eduAdmin
        console.log("Selected eduAdmin:", navigation.selectedEduAdmin);
        console.log("All schools:", data.schools);
        return data.schools.filter((school: any) => {
          console.log("School:", school.name, "eduAdminId:", school.eduAdminId);
          return school.eduAdminId === navigation.selectedEduAdmin?.id;
        }) || [];
      default:
        return [];
    }
  };

  const getCurrentTitle = (): string => {
    switch (navigation.currentView) {
      case 'regions':
        return 'إدارة المناطق';
      case 'eduAdmins':
        return 'إدارة الإدارات التعليمية';
      case 'schools':
        return 'إدارة المدارس';
      default:
        return '';
    }
  };

  const getCurrentPlaceholder = (): string => {
    switch (navigation.currentView) {
      case 'regions':
        return 'اكتب اسم المنطقة';
      case 'eduAdmins':
        return 'اكتب اسم الإدارة التعليمية';
      case 'schools':
        return 'اكتب اسم المدرسة';
      default:
        return '';
    }
  };

  const handleItemClick = (item: EntityItem) => {
    if (navigation.currentView === 'regions') {
      setNavigation({
        currentView: 'eduAdmins',
        selectedRegion: item,
        breadcrumb: ['المناطق', item.name, 'الإدارات التعليمية']
      });
    } else if (navigation.currentView === 'eduAdmins') {
      setNavigation({
        currentView: 'schools',
        selectedRegion: navigation.selectedRegion,
        selectedEduAdmin: item,
        breadcrumb: ['المناطق', navigation.selectedRegion?.name || '', 'الإدارات التعليمية', item.name, 'المدارس']
      });
    }
  };

  const handleBackClick = () => {
    if (navigation.currentView === 'schools') {
      setNavigation({
        currentView: 'eduAdmins',
        selectedRegion: navigation.selectedRegion,
        breadcrumb: ['المناطق', navigation.selectedRegion?.name || '', 'الإدارات التعليمية']
      });
    } else if (navigation.currentView === 'eduAdmins') {
      setNavigation({
        currentView: 'regions',
        breadcrumb: ['المناطق']
      });
    }
  };

  const handleAddInput = () => {
    setNewItems([...newItems, ""]);
  };

  const handleInputChange = (index: number, value: string) => {
    const updated = [...newItems];
    updated[index] = value;
    setNewItems(updated);
  };

  const handleRemoveInput = (index: number) => {
    if (newItems.length > 1) {
      const updated = newItems.filter((_, i) => i !== index);
      setNewItems(updated);
    }
  };

  const showBackButton = navigation.currentView !== 'regions';
  const showItemNavigation = navigation.currentView !== 'schools';

  return (
    <div className="h-full mb-[423px]">
      <div className="w-full h-full bg-white rounded-2xl border border-solid border-[#d0d5dd]">
        <div className="flex flex-col gap-[46px] lg:p-[42px] max-lg:p-[22px] items-start">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#717680] [direction:rtl]">
            {navigation.breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                <span>{item}</span>
                {index < navigation.breadcrumb.length - 1 && (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Back Button */}
          {showBackButton && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBackClick}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>العودة</span>
            </Button>
          )}

          {/* Main Card */}
          <Card className="w-full flex flex-col items-center justify-center gap-6 p-4 bg-white rounded-xl border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs">
            <Form method="post" className="w-full">
              <input type="hidden" name="actionType" value="create" />
              <input type="hidden" name="entityType" value={
                navigation.currentView === 'regions' ? 'region' : 
                navigation.currentView === 'eduAdmins' ? 'eduAdmin' : 'school'
              } />
              <input type="hidden" name="parentId" value={
                navigation.currentView === 'eduAdmins' ? navigation.selectedRegion?.id : 
                navigation.currentView === 'schools' ? navigation.selectedEduAdmin?.id : ''
              } />
              
              <div className="flex w-full h-14 items-center justify-center gap-3 p-5 bg-[#006173] rounded-xl shadow-shadows-shadow-xs">
                <div className="flex flex-1 md:flex-initial gap-2 w-full md:w-auto">
                  <Button
                    type="submit"
                    variant="outline"
                    className="flex flex-1 md:w-[120px] items-center justify-center gap-1 px-3 py-2 mt-[-10px] mb-[-10px] bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
                  >
                    <span className="relative w-fit mt-[-1px] font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                      حفظ
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex flex-1 md:w-[120px] items-center justify-center gap-1 px-3 py-2 mt-[-10px] mb-[-10px] bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
                    onClick={handleAddInput}
                  >
                    <span className="relative w-fit mt-[-1px] mr-2 font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                      إضافة
                    </span>
                    <img src={plusImg} alt="plus Logo" />
                  </Button>
                </div>
                <div className="flex flex-col items-start gap-0.5 flex-1 grow mt-[-4px] mb-[-4px]">
                  <span className="relative self-stretch mt-[-1px] font-bold text-white text-base tracking-[0] leading-6 [direction:rtl]">
                    {getCurrentTitle()}
                  </span>
                </div>
                <div className="relative w-8 h-8 mt-[-8px] mb-[-8px] bg-white rounded-md overflow-hidden border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic max-md:hidden">
                  <div className="absolute w-4 h-4 top-2 left-2">
                    <img src={UserIcon} alt="" />
                  </div>
                </div>
              </div>

              {/* New Items Input */}
              <CardContent className="p-0 w-full mt-3">
                <div className="flex flex-col gap-3 w-full">
                  {newItems.map((item, index) => (
                    <div key={index} className="w-full [direction:rtl]">
                      <div className="flex items-center gap-2 px-3 py-2 w-full bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs">
                        <Input
                          className="flex-1 border-none shadow-none font-normal text-[#717680] text-base tracking-[0] leading-6 [direction:rtl]"
                          placeholder={getCurrentPlaceholder()}
                          name="itemName"
                          value={item}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                        />
                        {newItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveInput(index)}
                          >
                            <MinusCircleIcon className="w-4 h-4 cursor-pointer text-[#A4A7AE]" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Form>
          </Card>

          {/* Existing Items */}
          <Card className="w-full flex flex-col items-center justify-center gap-6 p-4 bg-white rounded-xl border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs">
            <div className="flex w-full h-14 items-center justify-center gap-3 p-5 bg-[#006173] rounded-xl shadow-shadows-shadow-xs">
              <div className="flex flex-col items-start gap-0.5 flex-1 grow mt-[-4px] mb-[-4px]">
                <span className="relative self-stretch mt-[-1px] font-bold text-white text-base tracking-[0] leading-6 [direction:rtl]">
                  {getCurrentTitle()} الموجودة
                </span>
              </div>
              <div className="relative w-8 h-8 mt-[-8px] mb-[-8px] bg-white rounded-md overflow-hidden border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic max-md:hidden">
                <div className="absolute w-4 h-4 top-2 left-2">
                  <img src={UserIcon} alt="" />
                </div>
              </div>
            </div>
            
            <CardContent className="p-0 w-full mt-3">
              <div className="flex flex-col gap-3 w-full">
                {getCurrentItems().map((item) => (
                  <div key={item.id} className="w-full [direction:rtl]">
                    <div className="flex items-center gap-2 px-3 py-2 w-full bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs">
                      <div className="flex-1 font-normal text-[#717680] text-base tracking-[0] leading-6 [direction:rtl]">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2">
                        {showItemNavigation && (
                          <button
                            type="button"
                            onClick={() => handleItemClick(item)}
                            className="text-[#006173] hover:text-[#004a5a] transition-colors"
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        )}
                        <Form method="post" className="inline">
                          <input type="hidden" name="actionType" value="delete" />
                          <input type="hidden" name="entityType" value={
                            navigation.currentView === 'regions' ? 'region' : 
                            navigation.currentView === 'eduAdmins' ? 'eduAdmin' : 'school'
                          } />
                          <input type="hidden" name="entityId" value={item.id} />
                          <button type="submit">
                            <MinusCircleIcon className="w-4 h-4 cursor-pointer text-[#A4A7AE] hover:text-red-500 transition-colors" />
                          </button>
                        </Form>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getCurrentItems().length === 0 && (
                  <div className="text-center text-[#717680] py-8 [direction:rtl]">
                    لا توجد عناصر متاحة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageData;
