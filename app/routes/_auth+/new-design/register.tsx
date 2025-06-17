import { CheckIcon, ChevronDownIcon, MailIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
import { useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import LoadingOverlay from "~/components/loading-overlay";
import registerLogo from "../../../assets/images/new-design/logo-login.svg";
import arrowLeft from "../../../assets/icons/square-arrow-login.svg";
import arrowregister from "../../../assets/icons/arrow-White.svg";
import { SelectGroup } from "~/components/ui/select";
 
import { loader } from "../api.auth.$";
import { Region, School, EduAdmin } from "@prisma/client"; // Import your types


export const NewRegister = (): JSX.Element => {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [school, setSchool] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  
  // Get data from loader
  const loaderData = useLoaderData<typeof loader>();
  const regions = loaderData.regions || [];
  const eduAdmins = loaderData.eduAdmins || [];
  const allSchools = loaderData.schools || [];

    useEffect(() => {
    if (region) {
      // Find education admin for the selected region
      const regionAdmin = eduAdmins.find(admin => 
        admin.region?.name === region
      );
      
      // Find schools for this education admin
      const filteredSchools = allSchools.filter(school => 
        school.eduAdmin?.id === regionAdmin?.id
      );
      
      setSchools(filteredSchools);
    } else {
      setSchools([]);
    }
    setSchool(""); // Reset school selection
  }, [region]);

  useEffect(() => {
    // ... existing validation logic ...
    if (touched.school && !school) {
      newErrors.school = "يرجى اختيار المدرسة";
    }
    // ... rest of validation ...
  }, [touched, school]);
  // Add school to signup payload
  const signUp = async (e: React.MouseEvent) => {
    // ... existing code ...
    await authClient.signUp.email(
      {
        // ... existing fields ...
        school, // Add this line
      },
      // ... existing options ...
    );
  };

  
  // Update form completeness check
  const areAllFieldsFilled = () => {
    return (
      // ... existing checks ...
      school.trim() !== ""
    );
  };
  return (
    <div className="bg-white flex h-screen w-full overflow-hidden [direction:rtl]">
      {/* Logo section */}

      {navigation.state === "loading" && (
        <LoadingOverlay message="جاري التحميل" />
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden items-center justify-center">
        {/* Left form section */}

        <div className="lg:p-8 flex flex-col max-lg:mx-5">
          {/* Header section */}
          <div className="flex justify-between p-4">
            <div className="flex justify-end p-4">
              <img className="h-[70px]" alt="Group" src={registerLogo} />
            </div>
            <button
              onClick={() => navigate("/")}
              className="button font-bold text-center text-xs md:text-sm rounded-lg text-gray-700  transition-all"
            >
              <img
                className=""
                alt="Group"
                src={arrowLeft}
              />
            </button>
          </div>
          <header className="flex flex-col items-end gap-6 mb-3 ">
            <div className="flex-col items-end gap-3 w-full">
              <div className="font-bold text-[#181d27] text-3xl tracking-[0] leading-6">
                تسجيل حساب جديد
              </div>
              <div className="font-medium text-[#535861] text-base tracking-[0] leading-6 mt-5">
                يرجى تسجيل بياناتك
              </div>
            </div>
          </header>

          {/* Form fields */}
          <div className="flex flex-col md:flex-row gap-8 ">
            {/* Right column */}
            <div className="flex-1 space-y-6">
              {/* Full Name Field */}
              <div className="flex flex-col gap-1.5">
                <div className="inline-flex items-start gap-0.5">
                  <div className="text-[#1C81AC]">*</div>
                  <div className="font-medium text-[#414651] text-sm tracking-[0] leading-5">
                    الاسم الرباعي
                  </div>
                </div>
                <Input
                  className="justify-end gap-2 px-[10px] py-[14px] text-[#717680] bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]"
                  defaultValue="خالد محمد المسلم"
                />
              </div>

              {/* Phone Number Field */}
              <div className="flex flex-col gap-1.5">
                <div className="inline-flex items-start gap-0.5">
                  <div className="text-[#1C81AC]">*</div>
                  <div className="font-medium text-[#414651] text-sm tracking-[0] leading-5">
                    رقم الجوال
                  </div>
                </div>
                <div className="flex gap-2 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs">
                  <div className="flex items-center gap-1 px-3 py-2 overflow-hidden">
                    <div className="font-normal text-[#414651] text-base tracking-[0] leading-6 whitespace-nowrap">
                      SA
                    </div>
                    <ChevronDownIcon className="relative w-5 text-[#717680]" />
                  </div>
                  <input
                    className="flex-1 font-normal h-11 px-[10px] py-[14px] text-[#717680] text-base text-right border-0 rounded-md   border-input shadow-none p-0"
                    defaultValue="+966 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <div className="inline-flex items-start gap-0.5">
                  <div className="text-[#1C81AC]">*</div>
                  <div className="font-medium text-[#414651] text-sm tracking-[0] leading-5">
                    البريد الإلكتروني
                  </div>
                </div>
                <div className="flex justify-end items-center gap-2 px-2.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs">
                  <MailIcon className="relative w-5 text-[#717680]" />
                  <input
                    className="flex-1 font-normal h-11 text-[#717680] text-base text-right border-0 shadow-none p-0"
                    defaultValue="Kmsalms@gmail.com"
                  />
                </div>
              </div>

              {/* Role selection toggle */}
              <ToggleGroup
                type="single"
                defaultValue="مشرف"
                className="flex h-11 items-center justify-center gap-0.5 bg-neutral-50 rounded-lg border border-solid border-[#e9e9eb]"
              >
                <ToggleGroupItem
                  value="مدرب"
                  className="flex h-11 items-center justify-center gap-2 px-3 py-2 relative flex-1 grow rounded-lg overflow-hidden data-[state=off]:bg-transparent data-[state=on]:bg-white data-[state=on]:border data-[state=on]:border-solid data-[state=on]:border-[#d5d6d9] data-[state=on]:shadow-shadows-shadow-xs"
                >
                  <div className="w-fit font-bold text-[#717680] text-base text-left whitespace-nowrap [direction:rtl] relative tracking-[0] leading-6 data-[state=on]:text-[#414651]">
                    مدرب
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="مشرف"
                  className="flex h-11 items-center justify-center gap-2 px-3 py-2 relative flex-1 grow rounded-lg overflow-hidden data-[state=off]:bg-transparent data-[state=on]:bg-white data-[state=on]:border data-[state=on]:border-solid data-[state=on]:border-[#d5d6d9] data-[state=on]:shadow-shadows-shadow-xs"
                >
                  <div className="w-fit font-bold text-[#414651] text-base text-left whitespace-nowrap [direction:rtl] relative tracking-[0] leading-6">
                    مشرف
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Left column */}
            <div className="flex-1 space-y-6">
              {/* Region Field */}
              <div className="flex flex-col gap-1.5">
                <div className="inline-flex items-start gap-0.5">
                  <div className="text-[#1C81AC]">*</div>
                  <div className="font-medium text-[#414651] text-sm tracking-[0] leading-5">
                    المنطقة
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="justify-end gap-2 px-3.5  bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]">
                    <div className="flex-1 text-start font-normal text-[#717680] text-base">
                      {region || "اختر المنطقة"}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup
                      value={region}
                    onValueChange={setRegion}>
                      
                    </SelectGroup>
                       {regions.map((reg) => (
                    <SelectItem   key={reg.id}
                        className={`${region === reg.name ? "bg-gray-50" : ""}`} 
                        value={reg.name}>  {reg.name}</SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Education Department Field */}
              <div className="flex flex-col gap-1.5">
                <div className="inline-flex items-start gap-0.5">
                  <div className="text-[#1C81AC]">*</div>
                  <div className="font-medium text-[#414651] text-sm tracking-[0] leading-5">
                    الإدارة التابعة
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="justify-end gap-2 px-3.5  bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]">
                    <div className="flex-1 text-start font-normal text-[#717680] text-base">
                      إدارة تعليم
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>

                    </SelectGroup>
                    <SelectItem value="education">إدارة تعليم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* School Field with Dropdown */}
              <div className="flex flex-col gap-1.5">
                <div className="inline-flex items-start gap-0.5">
                  <div className="text-[#1C81AC]">*</div>
                  <div className="font-medium text-[#414651] text-sm tracking-[0] leading-5">
                    المدرسة
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="justify-end gap-2 px-3.5  bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]">
                    <div className="flex-1 text-start font-normal text-[#717680] text-base">
                     {school || (schools.length ? "اختر المدرسة" : "لا توجد مدارس متاحة")}
                    </div>
                  </SelectTrigger>
                  
                  <SelectContent className="max-h-64 [direction:rtl]">

                    <SelectGroup
                        value={school}
                    onValueChange={(value) => {
                      setSchool(value);
                      setTouched(prev => ({ ...prev, school: true }));
                    }}
                    >

                    </SelectGroup>
                    {schools.map((s) => (
                      <SelectItem
                       key={s.id}
                        className={`${school === s.name ? "bg-gray-50" : ""}`} 
                        value={s.name}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#181d27] text-base">
                             {s.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                   {errors.school && touched.school && (
                <span className="text-red-600 text-xs">{errors.school}</span>
              )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button className="max-md:mt-[20px] mb-3 md:mt-[90px] bg-[#006E7F] hover:bg-[#005a68] text-white rounded-lg [direction:rtl] font-bold text-base py-3">
            تسجيل
            <img src={arrowregister} alt="arrow-left" />
          </Button>
        </div>

        {/* Right image section */}
      </div>

      <div
        className=" lg:block w-5/12  max-lg:hidden h-full bg-no-repeat bg-cover"
        style={{
          backgroundImage:
            "url(app/assets/images/new-design/section.png)",
        }}
      />
    </div>
  );
};
