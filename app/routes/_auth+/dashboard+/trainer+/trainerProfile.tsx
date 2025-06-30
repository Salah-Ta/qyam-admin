import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";
import reportDB from "~/db/report/report.server";
import { MinusCircleIcon, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./assets/avatar";
import { Badge } from "./assets/badge";
import { Button } from "./assets/button";
import { Card, CardContent } from "./assets/card";
import { Checkbox } from "./assets/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./assets/tabs";
import { Textarea } from "./assets/textarea";
import { useState } from "react";
import {
  useLoaderData,
  useRouteLoaderData,
  useSubmit,
  useNavigation,
} from "@remix-run/react";
// import reportservice from "../../../../db/report/report.server";
import { toast as sonnerToast } from "sonner";

import Group30476 from "../../../../assets/images/new-design/group-3.svg";
import sendicon from "../../../../assets/icons/send.svg";
import avatar from "../../../../assets/icons/avatar.svg";
import verifiedTick from "../../../../assets/icons/Verified-tick.svg";
import mail from "../../../../assets/icons/mail.svg";
import phone from "../../../../assets/icons/phone.svg";

import region from "../../../../assets/icons/region.svg";

import profile from "../../../../assets/icons/profile.svg";
import { CreateReportData } from "~/types/types";
import { getToast } from "~/lib/toast.server";
import React from "react";
import { createToastHeaders } from "~/lib/toast.server";

export type LoaderData = {
  materials: any;
};

export async function loader({
  request,
  context,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  // Fetch other data as needed
  const DBurl = context.cloudflare.env.DATABASE_URL;
  const materials = await materialDB.getAllMaterials(
    context.cloudflare.env.DATABASE_URL
  );

  // load reportDB all reports
  const reports = await reportDB.getAllReports(
    context.cloudflare.env.DATABASE_URL
  );

  const { toast, headers } = await getToast(request);

  return Response.json({
    materials: materials.data,
    DBurl,
    toast,
    headers,
    reports: reports.data,
  });
}

export async function action({ request, context }: LoaderFunctionArgs) {
  const DBurl = context.cloudflare.env.DATABASE_URL;
  const formData = await request.formData();
  const reportData = JSON.parse(formData.get("reportData") as string);
  console.log("Received report data:", reportData);

  try {
    await reportDB.createReport(reportData, DBurl);
    const headers = await createToastHeaders({
      type: "success",
      description: "تم إرسال التقرير بنجاح",
    });
    return json({ success: true }, { headers });
  } catch (error) {
    const headers = await createToastHeaders({
      type: "error",
      description: "حدث خطأ أثناء إرسال التقرير",
    });
    return json(
      { success: false, error: error.message },
      { status: 500, headers }
    );
  }
}

export const TrainerProfile = () => {
  const { user } = useRouteLoaderData<any>("root");

  const { materials, DBurl, reports } = useLoaderData<any>();

  console.log(user, materials, reports);

  // Show toast if present

  // Now you can use `user` in your component

  // Data for review opinions
  const [opinions, setOpinions] = useState([
    { id: 1, title: "", active: true, comment: "" },
  ]);
  const [activeTab, setActiveTab] = useState("opinion-1");

  // Handler to add a new opinion
  const handleAddOpinion = () => {
    const newId =
      opinions.length > 0 ? opinions[opinions.length - 1].id + 1 : 1;
    setOpinions([
      ...opinions.map((op) => ({ ...op, active: false })),
      { id: newId, title: "", active: true, comment: "" },
    ]);
    setActiveTab(`opinion-${newId}`);
  };

  // filepath: c:\Users\aminj\OneDrive\Documents\GitHub\qyam-admin\app\routes\_auth+\dashboard+\trainer+\trainerProfile.tsx
  const submit = useSubmit();

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();

    const latestReportData: CreateReportData = {
      ...reportData,
      skillIds: skillsColumns
        .flat()
        .filter((skill) => skill.checked)
        .map((skill) => skill.id),
      testimonials: opinions.map((opinion) => ({
        name: opinion.title,
        comment: opinion.comment ?? "",
      })),
    };

    console.log("Submitting report data:", latestReportData);

    const formData = new FormData();
    formData.append("reportData", JSON.stringify(latestReportData));

    submit(formData, { method: "post" });
  };

  // Handler to toggle tab open/close
  const handleTabClick = (id: number) => {
    setActiveTab((prev) => (prev === `opinion-${id}` ? "" : `opinion-${id}`));
  };

  // Handler to update opinion title or comment
  const handleOpinionChange = (
    id: number,
    field: "title" | "comment",
    value: string
  ) => {
    setOpinions((prev) =>
      prev.map((op) => (op.id === id ? { ...op, [field]: value } : op))
    );
  };

  // // Data for progress checklist
  // const progressItems = [
  //   { id: 1, title: "التقارير", completed: true },
  //   { id: 2, title: "رأي المتدربات", completed: true },
  //   { id: 3, title: "المهارات", completed: true },
  // ];

  // // Data for sidebar menu items
  // const menuItems = [
  //   { id: 1, title: "مركز المعرفة" },
  //   { id: 2, title: "شهاداتي" },
  //   { id: 3, title: "ركائز نجاح البرنامج" },
  //   { id: 4, title: "تقرير إنجازاتي" },
  // ];

  // User data for feedback section
  const userData = [
    {
      id: 1,
      label: "الاسم :",
      icon: profile,
      key: "name",
    },
    {
      id: 2,
      label: "الجوال :",
      icon: phone,
      key: "phone",
    },
    {
      id: 3,
      label: "الايميل :",
      icon: mail,
      key: "email",
    },
    {
      id: 4,
      label: "المنطقة : ",
      icon: region,
      key: "region",
    },
    { id: 5, label: "الإدارة : ", icon: null, key: "education" },
  ];

  // Message data for navigation section
  const messageData = {
    author: "أ/ محمد المسلم مشرف تربوي",
    timeAgo: "منذ دقيقتين",
    content:
      "شكرا على جعودكم الكريمة أ.نورة الشهري , على جهدكم المبذول الكبير , مع تمنياتنا لكم بالتوفيق الكبير",
    avatarUrl: avatar,
    verifiedIconUrl: verifiedTick,
  };

  // Data for metric cards
  const metricCards = [
    { title: "الساعات التطوعية المحققة", value: "0", key: "volunteerHours" },
    { title: "المتطوعات المشاركات", value: "0" },
    { title: "الأنشطة التي نفذت", value: "0" },
    {
      title: "الفرص التطوعية المنفذة",
      value: "0",
      key: "volunteerOpportunities",
    },
    { title: "القيمية الاقتصادية من التطوع", value: "0" },
    { title: "القيمة الاقتصادية للمهارات", value: "0" },
    { title: "المهارات اللي تم تدريب الفتيات عليها", value: "0" },
  ];

  // Data for the skills checklist organized in columns
  const [skillsColumns, setSkillsColumns] = useState([
    [
      {
        id: "concept",
        label: "معرفة مفهوم التطوع شرعا ونظاما",
        checked: false,
      },
      { id: "dialogue", label: "مهارات الحوار والعمل الجماعي", checked: false },
      { id: "communication", label: "مهارات الاتصال", checked: false },
      { id: "selfAwareness", label: "تنمية الوعي الذاتي", checked: false },
      {
        id: "digitalTools",
        label: "استخدام الأدوات الرقمية في الأنشطة التطوعية",
        checked: false,
      },
      { id: "selfConfidence", label: "الثقة بالنفس", checked: false },
      {
        id: "careerPath",
        label: "تحديد المسار التعليمي والمهني المناسب",
        checked: false,
      },
    ],
    [
      { id: "timeManagement", label: "إدارة الوقت", checked: false },
      {
        id: "rightsAndDuties",
        label: "تحديد حقوق وواجبات المتطوع",
        checked: false,
      },
      {
        id: "socialRoles",
        label: "إدراك الأدوار الاجتماعية المختلفة",
        checked: false,
      },
      {
        id: "criticalThinking",
        label: "مهارات التفكير الناقد",
        checked: false,
      },
      { id: "problemSolving", label: "حل المشكلات", checked: false },
      {
        id: "nationalIdentity",
        label: "الاعتزاز بالثقافة والهوية الوطنية",
        checked: false,
      },
      { id: "creativity", label: "مهارات الإبداع", checked: false },
    ],
    [
      {
        id: "resilience",
        label: "الصلابة النفسية، والتعامل مع التحديات",
        checked: false,
      },
      {
        id: "careerPlanning",
        label: "تحديد المسار التعليمي والمهني المناسب",
        checked: false,
      },
      { id: "strengths", label: "اكتشاف نقاط القوة وتوظيفها", checked: false },
      {
        id: "identity",
        label: "بناء الهوية الذاتية والقيم الأصيلة",
        checked: false,
      },
      {
        id: "ageCharacteristics",
        label: "التعرف على خصائص المرحلة العمرية",
        checked: false,
      },
      {
        id: "platformAccount",
        label: "امتلاك حساب في المنصة الوطنية للعمل التطوعي",
        checked: false,
      },
      { id: "responsibility", label: "تحمل المسؤولية", checked: false },
    ],
  ]);
  const handleCheckboxChange = (
    columnIndex: number,
    skillIndex: number,
    checked: boolean
  ) => {
    setSkillsColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[columnIndex] = [...updatedColumns[columnIndex]];
      updatedColumns[columnIndex][skillIndex] = {
        ...updatedColumns[columnIndex][skillIndex],
        checked,
      };
      return updatedColumns;
    });
  };

  function handleValueChange(index: number, value: string): void {
    setSkillsColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      const columnIndex = Math.floor(index / 7); // Assuming 7 items per column
      const skillIndex = index % 7;
      if (
        updatedColumns[columnIndex] &&
        updatedColumns[columnIndex][skillIndex]
      ) {
        updatedColumns[columnIndex][skillIndex].label = value;
      }
      return updatedColumns;
    });
  }

  // Example: mapping metricCards and skillsColumns to CreateReportData
  const createReportData: CreateReportData = {
    userId: user?.id ?? "",
    volunteerHours: Number(metricCards[0].value),
    volunteerCount: Number(metricCards[1].value),
    activitiesCount: Number(metricCards[2].value),
    volunteerOpportunities: Number(metricCards[3].value),
    economicValue: Number(metricCards[4].value),
    skillsEconomicValue: Number(metricCards[5].value),
    skillsTrainedCount: Number(metricCards[6].value),
    attachedFiles: [],
    skillIds: skillsColumns
      .flat()
      .filter((skill) => skill.checked)
      .map((skill) => skill.id),
    testimonials: opinions.map((opinion, idx) => ({
      name: opinion.title,
      comment: opinion.title ?? "",
    })),
  };

  // Add state for createReportData to enable editing
  const [reportData, setReportData] =
    useState<CreateReportData>(createReportData);

  // Helper to update a field in reportData
  const handleReportFieldChange = (
    field: keyof CreateReportData,
    value: string
  ) => {
    console.log(`Updating field ${field} with value:`, value);
    console.log(` reportData: ---- `, reportData);

    setReportData((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const navigation = useNavigation();

  // Add this effect to reset form after successful submit
  React.useEffect(() => {
    // Reset report data
    setReportData({
      userId: user?.id ?? "",
      volunteerHours: 0,
      volunteerCount: 0,
      activitiesCount: 0,
      volunteerOpportunities: 0,
      economicValue: 0,
      skillsEconomicValue: 0,
      skillsTrainedCount: 0,
      attachedFiles: [],
      skillIds: [],
      testimonials: [],
    });
    // Reset opinions
    setOpinions([{ id: 1, title: "", active: true, comment: "" }]);
    setActiveTab("opinion-1");
    // Reset skills
    setSkillsColumns([
      [
        {
          id: "concept",
          label: "معرفة مفهوم التطوع شرعا ونظاما",
          checked: false,
        },
        {
          id: "dialogue",
          label: "مهارات الحوار والعمل الجماعي",
          checked: false,
        },
        { id: "communication", label: "مهارات الاتصال", checked: false },
        { id: "selfAwareness", label: "تنمية الوعي الذاتي", checked: false },
        {
          id: "digitalTools",
          label: "استخدام الأدوات الرقمية في الأنشطة التطوعية",
          checked: false,
        },
        { id: "selfConfidence", label: "الثقة بالنفس", checked: false },
        {
          id: "careerPath",
          label: "تحديد المسار التعليمي والمهني المناسب",
          checked: false,
        },
      ],
      [
        { id: "timeManagement", label: "إدارة الوقت", checked: false },
        {
          id: "rightsAndDuties",
          label: "تحديد حقوق وواجبات المتطوع",
          checked: false,
        },
        {
          id: "socialRoles",
          label: "إدراك الأدوار الاجتماعية المختلفة",
          checked: false,
        },
        {
          id: "criticalThinking",
          label: "مهارات التفكير الناقد",
          checked: false,
        },
        { id: "problemSolving", label: "حل المشكلات", checked: false },
        {
          id: "nationalIdentity",
          label: "الاعتزاز بالثقافة والهوية الوطنية",
          checked: false,
        },
        { id: "creativity", label: "مهارات الإبداع", checked: false },
      ],
      [
        {
          id: "resilience",
          label: "الصلابة النفسية، والتعامل مع التحديات",
          checked: false,
        },
        {
          id: "careerPlanning",
          label: "تحديد المسار التعليمي والمهني المناسب",
          checked: false,
        },
        {
          id: "strengths",
          label: "اكتشاف نقاط القوة وتوظيفها",
          checked: false,
        },
        {
          id: "identity",
          label: "بناء الهوية الذاتية والقيم الأصيلة",
          checked: false,
        },
        {
          id: "ageCharacteristics",
          label: "التعرف على خصائص المرحلة العمرية",
          checked: false,
        },
        {
          id: "platformAccount",
          label: "امتلاك حساب في المنصة الوطنية للعمل التطوعي",
          checked: false,
        },
        { id: "responsibility", label: "تحمل المسؤولية", checked: false },
      ],
    ]);
  }, [navigation.state, navigation.formMethod, user?.id]);

  return (
    <form
      onSubmit={handleSendReport}
      className="flex flex-col w-full max-w-full overflow-hidden"
    >
      {/* Navigation Section */}
      <div className="w-full rounded-xl mb-4 [direction:rtl]">
        <Card className="relative w-full border-[1px] border-[#004E5C] shadow-shadows-shadow-xs rounded-xl p-4 flex flex-col gap-4 [direction:rtl]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-5 right-5 h-9 w-9 p-2 bg-neutral-50 rounded-lg"
          >
            <XIcon className="h-5 w-5" />
          </Button>
          <CardContent className="p-0 flex flex-col gap-3">
            <div className="relative w-10 h-10">
              <Avatar className="w-10 h-10 border-[0.75px] border-solid border-[#00000014]">
                <AvatarImage src={messageData.avatarUrl} alt="User avatar" />
                <AvatarFallback>MS</AvatarFallback>
              </Avatar>
              <img
                className="absolute w-3.5 h-3.5 bottom-0 right-0"
                alt="Verified tick"
                src={messageData.verifiedIconUrl}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#181d27] ">
                  {messageData.author}
                </span>
                <span className="text-sm text-[#717680] ">
                  {messageData.timeAgo}
                </span>
              </div>
              <p className="text-sm text-[#414651] ">{messageData.content}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Section */}
      <div className="w-full max-w-full mb-4 [direction:rtl]">
        <Card className="w-full flex flex-col gap-[18px] p-[18px] bg-white border border-[#d5d6d9] shadow-[0px_1px_2px_#0a0d120d] rounded-[12px]">
          <div className="flex flex-col items-start justify-center px-2 py-1 w-full bg-[#f7f7f7] rounded-[8px]">
            <div className="flex w-full items-center justify-start gap-2">
              <img
                className="w-[21.5px] h-[19.5px]"
                alt="Location icon"
                src={region}
              />
              <h2 className="font-bold text-2xl text-labelsprimary">بياناتي</h2>
            </div>
          </div>

          <CardContent className="flex flex-wrap items-start justify-start gap-[18px] p-0 max-md:flex-col max-md:w-full">
            {userData.map((item) => (
              <div
                key={item.id}
                className="inline-flex items-center justify-start gap-3 p-2.5 bg-white rounded-[8px] border border-solid border-[#d0d5dd] max-md:w-full"
              >
                {typeof item.icon === "string" && (
                  <img src={item.icon} alt="icon" className="w-5 h-5" />
                )}
                <div className="font-medium text-[#1f2a37] text-base tracking-[0] leading-[normal] [direction:rtl]">
                  {item.label} {user?.[item.key] ?? "-"}
                </div>
              </div>
            ))}

            <div className="inline-flex flex-col items-start gap-1.5 max-md:w-full ">
              <div className="inline-flex items-center md:justify-end  max-md:items-start gap-2 px-3.5 py-2.5 bg-white rounded-[8px] overflow-hidden border border-solid border-[#d0d5dd] shadow-[0px_1px_2px_#1018280d] max-md:w-full">
                <div className="inline-flex gap-2 items-center md:justify-endjustify-end max-md:w-full ">
                  <Badge className="w-2.5 h-2.5 p-0 flex items-center justify-center bg-transparent">
                    <div className="w-2 h-2 bg-[#199491] rounded-full"></div>
                  </Badge>
                  <div className="font-medium text-gray-900 text-base md:text-left  tracking-[0] leading-[normal] [direction:rtl]  ">
                    المدرسة : خالد بن الوليد
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Notification Section */}
      <div className="w-full max-w-full mb-4 [direction:rtl]">
        <Card className="flex flex-col w-full items-center justify-center gap-6 p-4 bg-white rounded-xl border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs">
          {/* Header section remains unchanged */}
          <div className="flex w-full h-[50px] items-center justify-between px-2 py-1 relative bg-[#199491] rounded-[8px]">
            <div className="inline-flex items-center gap-[272px] relative flex-[0_0_auto]">
              <h2 className="relative w-fit mt-[-1.00px] font-bold text-white text-2xl tracking-[0] leading-[normal] [direction:rtl]">
                التقارير
              </h2>
            </div>
            <div className="relative w-fit font-normal text-white text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl] max-md:hidden">
              تم تقييم 4 من أصل 7
            </div>
            <div></div>
            {/* <Button
              variant="outline"
              className="flex w-[120px] items-center justify-center gap-1 px-3 py-2 bg-white rounded-md overflow-hidden border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
            >
              <span className="relative w-fit font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                حفظ
              </span>
            </Button> */}
          </div>

          {/* Modified content section */}
          <div className="flex flex-wrap w-full items-center gap-y-6 p-0">
            <div className="flex flex-wrap w-full items-center gap-x-6 gap-y-6 p-0 max-md:flex-col max-md:gap-x-0">
              {[
                { title: "الساعات التطوعية المحققة", field: "volunteerHours" },
                { title: "المتطوعات المشاركات", field: "volunteerCount" },
                { title: "الأنشطة التي نفذت", field: "activitiesCount" },
                {
                  title: "الفرص التطوعية المنفذة",
                  field: "volunteerOpportunities",
                },
                {
                  title: "القيمية الاقتصادية من التطوع",
                  field: "economicValue",
                },
                {
                  title: "القيمة الاقتصادية للمهارات",
                  field: "skillsEconomicValue",
                },
                {
                  title: "المهارات اللي تم تدريب الفتيات عليها",
                  field: "skillsTrainedCount",
                },
              ].map((card, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-start gap-4 max-md:w-full"
                  style={{ flex: "0 0 calc(20% - 24px)" }}
                >
                  <div className="w-full font-medium text-sm md:text-left max-md:text-center text-black tracking-[0] [direction:rtl] whitespace-nowrap overflow-hidden text-ellipsis mb-2">
                    {card.title}
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-[136px] h-9 text-center font-medium text-[#1f2a37] text-sm bg-[#f8f9fb] rounded-[8px] border border-solid border-[#d0d5dd] focus:outline-none focus:ring-2 focus:ring-[#68c35c] max-md:w-full [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    style={{ MozAppearance: "textfield" }}
                    value={
                      reportData[card.field as keyof CreateReportData] ?? ""
                    }
                    onChange={(e) =>
                      handleReportFieldChange(
                        card.field as keyof CreateReportData,
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Review Section */}
      <Card className="w-full max-w-full mb-4 border border-[#d5d7da] rounded-[12px] [direction:rtl]">
        <CardContent className="m-4">
          {/* Header */}
          <Card className="flex flex-col w-full h-[50px] items-baseline justify-between px-2 py-2 bg-[#199491] rounded-[8px] border-none">
            <CardContent className="flex w-full justify-between items-center p-0">
              <h2 className=" font-bold text-white text-2xl [direction:rtl]">
                انطباع الطالبات
              </h2>
              <Button
                variant="outline"
                type="button"
                className="flex w-[120px] items-center justify-center gap-1 px-3 py-2 bg-white rounded-md overflow-hidden border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
                onClick={handleAddOpinion}
              >
                <span className="relative w-fit  font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                  أضف
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Review Opinions */}
          <Tabs value={activeTab} onValueChange={() => {}}>
            {/* Tabs List */}
            <TabsList className="flex-col w-full mt-5 rounded-[8px] p-0 h-auto">
              {opinions.map((opinion) => (
                <div key={opinion.id} className="w-full">
                  <TabsTrigger
                    value={`opinion-${opinion.id}`}
                    className={`flex items-center justify-between w-full p-3 h-[42px] rounded-lg ${
                      activeTab === `opinion-${opinion.id}`
                        ? "bg-[#ebedf0]"
                        : "bg-[#f9f9f9]"
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleTabClick(opinion.id);
                    }}
                    aria-selected={activeTab === `opinion-${opinion.id}`}
                    style={{ width: "100%" }}
                  >
                    <div className="flex items-center justify-end w-full gap-4">
                      <MinusCircleIcon className="w-6 h-6" />
                      <div className="flex items-start justify-end flex-1 w-full">
                        <div className="flex w-full gap-6 items-center justify-end">
                          <div className="flex-col w-full items-end gap-2 flex">
                            <input
                              className={`w-full font-bold ${
                                opinion.active ? "text-black" : "text-[#414651]"
                              } text-base leading-normal [direction:rtl] bg-transparent border-none outline-none`}
                              placeholder="عنوان الانطباع"
                              value={opinion.title}
                              onChange={(e) =>
                                handleOpinionChange(
                                  opinion.id,
                                  "title",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsTrigger>
                  {/* Show textarea directly below the active tab */}
                  {activeTab === `opinion-${opinion.id}` && (
                    <div className="w-full px-0 pb-4">
                      <Textarea
                        className="w-full text-right"
                        placeholder="اكتب هنا"
                        value={opinion.comment}
                        onChange={(e) =>
                          handleOpinionChange(
                            opinion.id,
                            "comment",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary and User Info Section */}
      <Card className="w-full max-w-full mb-4 border border-[#d5d7da] rounded-[12px] [direction:rtl]">
        <CardContent className="m-4">
          {/* Header */}
          <Card className="flex flex-col w-full h-[50px] items-center justify-between px-2 py-2 bg-[#199491] rounded-[8px] border-none">
            <CardContent className="flex w-full justify-between items-center p-0">
              <div className="flex items-baseline justify-between w-48">
                <span className=" font-bold text-white text-2xl ">
                  المهارات
                </span>
                <span className=" font-medium text-white text-xs max-md:hidden">
                  /22 مهارات مختارة
                </span>
              </div>
              <div></div>
            </CardContent>
          </Card>

          {/* Skills Checklist */}
          <div className="flex justify-start gap-6 py-4 px-3 mt-4 max-md:flex-col">
            {skillsColumns.map((column, columnIndex) => (
              <div
                key={columnIndex}
                className="flex flex-col w-full max-w-[275px] max-md:max-w-full items-end gap-4"
              >
                {column.map((skill, skillIndex) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-start gap-2 w-full max-md:w-full"
                  >
                    <div className="flex items-center justify-center">
                      <Checkbox
                        className="w-4 h-4 rounded border border-solid border-[#199491] data-[state=checked]:bg-[#199491]"
                        checked={skill.checked}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            columnIndex,
                            skillIndex,
                            Boolean(checked)
                          )
                        }
                      />
                    </div>
                    <span className="font-medium text-sm text-right whitespace-normal max-md:whitespace-nowrap">
                      {skill.label}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Bottom Action Button */}
      <div className="w-full max-w-full flex justify-center mt-[52px] [direction:rtl] ">
        <Button
          type="submit"
          className="w-full bg-[#006173] text-white hover:bg-[#0a7285]  h-[48px]"
        >
          إرسال التقرير
          <img src={sendicon} alt="" />
        </Button>
      </div>
    </form>
  );
};

export default TrainerProfile;
