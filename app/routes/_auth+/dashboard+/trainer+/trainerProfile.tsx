import { LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";
import reportDB from "~/db/report/report.server";
import skillDB from "~/db/skill/skill.server";
import messageDB from "~/db/message/message.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import { MinusCircleIcon, XIcon, CheckIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./assets/avatar";
import { Badge } from "./assets/badge";
import { Button } from "./assets/button";
import { Card, CardContent } from "./assets/card";
import { Checkbox } from "./assets/checkbox";
import { Textarea } from "./assets/textarea";
import { useState } from "react";
import {
  useLoaderData,
  useRouteLoaderData,
  useSubmit,
  useNavigation,
  useActionData,
} from "@remix-run/react";
import { CreateReportData } from "~/types/types";
import React from "react";
import sendicon from "../../../../assets/icons/send.svg";
import avatar from "../../../../assets/icons/user.png";
import verifiedTick from "../../../../assets/icons/Verified-tick.svg";
import mail from "../../../../assets/icons/mail.svg";
import phone from "../../../../assets/icons/phone.svg";
import region from "../../../../assets/icons/region.svg";
import profile from "../../../../assets/icons/profile.svg";

export type LoaderData = {
  materials: any;
};

export async function loader({
  request,
  context,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  // Get authenticated user
  const currentUser = await getAuthenticated({ request, context });
  
  if (!currentUser) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Fetch other data as needed
  const DBurl = context.cloudflare.env.DATABASE_URL;
  const materials = await materialDB.getAllMaterials(
    context.cloudflare.env.DATABASE_URL
  );

  // load reportDB all reports
  const reports = await reportDB.getAllReports(
    context.cloudflare.env.DATABASE_URL
  );

  // Fetch all skills
  const skills = await skillDB.getAllSkills(
    context.cloudflare.env.DATABASE_URL
  );

  // Fetch incoming messages for the current user
  let latestMessage = null;
  try {
    const messagesResult = await messageDB.getIncomingMessages(
      currentUser.id,
      context.cloudflare.env.DATABASE_URL
    );
    
    if (messagesResult.status === "success" && messagesResult.data && messagesResult.data.length > 0) {
      latestMessage = messagesResult.data[0]; // Get the latest message
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    // Continue without messages
  }

  return Response.json({
    materials: materials.data,
    DBurl,
    reports: reports.data,
    skills: skills.data,
    latestMessage,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const currentUser = await getAuthenticated({ request, context });

  if (!currentUser) {
    return Response.json(
      {
        status: "error",
        message: "غير مخول للوصول",
      },
      { status: 401 }
    );
  }

  const DBurl = context.cloudflare.env.DATABASE_URL;
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "markAsRead") {
    const messageId = formData.get("messageId")?.toString();

    if (!messageId) {
      return Response.json(
        {
          status: "error",
          message: "معرف الرسالة مطلوب",
        },
        { status: 400 }
      );
    }

    try {
      const result = await messageDB.markAsRead(messageId, DBurl);
      return Response.json({
        status: "success",
        message: "تم تحديث حالة الرسالة بنجاح",
        data: result,
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
      return Response.json(
        {
          status: "error",
          message: "فشل في تحديث حالة الرسالة",
        },
        { status: 500 }
      );
    }
  }

  // Original report creation logic
  const reportData = JSON.parse(formData.get("reportData") as string);
  console.log("Received report data:", reportData);

  try {
    await reportDB.createReport(reportData, DBurl);
    return json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export const TrainerProfile = () => {
  const { user } = useRouteLoaderData<any>("root");
  const { materials, DBurl, reports, skills, latestMessage } = useLoaderData<any>();
  const actionData = useActionData<any>();
  const navigation = useNavigation();

  console.log(user, materials, reports);
  console.log("All Skills:", skills);
  console.log("Latest Message:", latestMessage);

  // Show toast if present

  // Now you can use `user` in your component

  // Data for review opinions
  const [opinions, setOpinions] = useState([
    { id: 1, title: "", active: true, comment: "" },
  ]);
  const [activeTab, setActiveTab] = useState("opinion-1");

  // Track if form has unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [submitMessage, setSubmitMessage] = useState("");

  // Debug logging
  console.log("Navigation state:", navigation.state, "Form method:", navigation.formMethod);
  console.log("Action data:", actionData);
  console.log("Show submit popup:", showSubmitPopup, "Submit status:", submitStatus);

  // Function to reset all form data
  const resetFormData = React.useCallback(() => {
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
    // Reset skills - will be repopulated from API
    if (skills && Array.isArray(skills)) {
      const resetSkills = skills.map((skill: any) => ({
        id: skill.id,
        label: skill.name,
        checked: false,
      }));
      // Distribute skills across 3 columns
      const column1 = resetSkills.slice(0, Math.ceil(resetSkills.length / 3));
      const column2 = resetSkills.slice(Math.ceil(resetSkills.length / 3), Math.ceil(resetSkills.length * 2 / 3));
      const column3 = resetSkills.slice(Math.ceil(resetSkills.length * 2 / 3));
      setSkillsColumns([column1, column2, column3]);
    }
  }, [user?.id, skills]);

  // Update localStorage whenever there are changes
  React.useEffect(() => {
    localStorage.setItem(
      "hasUnsavedReportChanges",
      hasUnsavedChanges.toString()
    );
  }, [hasUnsavedChanges]);

  // Listen for reset events from parent component
  React.useEffect(() => {
    const handleReset = () => {
      // Reset all form data
      resetFormData();
      setHasUnsavedChanges(false);
    };

    window.addEventListener("resetTrainerProfile", handleReset);
    return () => window.removeEventListener("resetTrainerProfile", handleReset);
  }, []);

  // Handle mark as read response
  React.useEffect(() => {
    if (actionData && actionData.status === "success" && actionData.message === "تم تحديث حالة الرسالة بنجاح") {
      // Message was marked as read successfully
      console.log("Message marked as read successfully");
      // The loader will automatically refresh the data
    }
  }, [actionData]);

  // Handler to add a new opinion
  const handleAddOpinion = () => {
    const newId =
      opinions.length > 0 ? opinions[opinions.length - 1].id + 1 : 1;
    setOpinions([
      ...opinions.map((op) => ({ ...op, active: false })),
      { id: newId, title: "", active: true, comment: "" },
    ]);
    setActiveTab(`opinion-${newId}`);
    setHasUnsavedChanges(true);
  };

  // filepath: c:\Users\aminj\OneDrive\Documents\GitHub\qyam-admin\app\routes\_auth+\dashboard+\trainer+\trainerProfile.tsx
  const submit = useSubmit();

  // Handle marking message as read
  const handleMarkAsRead = (messageId: string) => {
    const formData = new FormData();
    formData.append("actionType", "markAsRead");
    formData.append("messageId", messageId);
    submit(formData, { method: "POST" });
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();

    // Show loading popup immediately
    setShowSubmitPopup(true);
    setSubmitStatus('loading');
    setSubmitMessage('جاري إرسال التقرير...');

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

    try {
      // Submit the form
      submit(formData, { method: "post" });
    } catch (error) {
      // Handle any immediate errors
      setSubmitStatus('error');
      setSubmitMessage('حدث خطأ أثناء إرسال التقرير. يرجى المحاولة مرة أخرى.');
    }
  };

  // Handler to toggle tab open/close
  const handleTabClick = (id: number) => {
    setActiveTab((prev) => (prev === `opinion-${id}` ? "" : `opinion-${id}`));
  };

  // Handler to delete an opinion
  const handleDeleteOpinion = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the toggle
    if (opinions.length > 1) {
      setOpinions(opinions.filter((op) => op.id !== id));
      // If deleting the active tab, clear active tab
      if (activeTab === `opinion-${id}`) {
        setActiveTab("");
      }
      setHasUnsavedChanges(true);
    }
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
    setHasUnsavedChanges(true);
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

  // Helper function to format time ago
  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  // Message data for navigation section - now dynamic
  const messageData = latestMessage ? {
    id: latestMessage.id,
    author: latestMessage.fromUser?.name || "مشرف تربوي",
    timeAgo: formatTimeAgo(latestMessage.sentAt || new Date()),
    content: latestMessage.content,
    avatarUrl: avatar, // You can add user avatar URL to the database later
    verifiedIconUrl: verifiedTick,
    isRead: latestMessage.isRead,
  } : {
    author: "لا توجد رسائل",
    timeAgo: "",
    content: "لا توجد رسائل جديدة",
    avatarUrl: avatar,
    verifiedIconUrl: verifiedTick,
    isRead: true,
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

  // Data for the skills checklist organized in columns - populated from API
  const [skillsColumns, setSkillsColumns] = useState<any[][]>([[], [], []]);
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  // Function to calculate progress for the NavFeatureCard
  const calculateProgress = () => {
    // Calculate reports section progress based on individual metric cards
    const metricValues = [
      reportData.volunteerHours,
      reportData.volunteerCount,
      reportData.activitiesCount,
      reportData.volunteerOpportunities,
      reportData.economicValue,
      reportData.skillsEconomicValue,
      reportData.skillsTrainedCount,
    ];

    const filledMetrics = metricValues.filter((value) => value > 0).length;
    const totalMetrics = metricValues.length;
    const reportsProgress =
      totalMetrics > 0 ? (filledMetrics / totalMetrics) * 100 : 0;
    const reportsCompleted = reportsProgress === 100; // Only complete when all fields are filled

    // Check if opinions section has meaningful data
    const opinionsCompleted = opinions.some(
      (opinion) => opinion.title.trim() !== "" || opinion.comment.trim() !== ""
    );

    // Check if skills section has any checked items
    const skillsCompleted = skillsColumns.some((column) =>
      column.some((skill) => skill.checked)
    );

    return {
      reportsCompleted,
      reportsProgress, // Add granular progress for reports
      opinionsCompleted,
      skillsCompleted,
    };
  };

  // Update progress data when form data changes
  React.useEffect(() => {
    const progressData = calculateProgress();
    // Store in localStorage for the parent to read
    localStorage.setItem("trainerProgressData", JSON.stringify(progressData));
    // Dispatch custom event to notify parent component
    window.dispatchEvent(new CustomEvent("trainerProgressUpdate"));
  }, [reportData, opinions, skillsColumns]);

  // Handle form submission response - simplified approach
  React.useEffect(() => {
    // If we have action data and popup is showing, process the response
    if (actionData && showSubmitPopup) {
      console.log("Processing action data:", actionData);
      
      if (actionData.success === true) {
        // Success case
        console.log("Success detected");
        setSubmitStatus('success');
        setSubmitMessage('شكراً لك على إرسال التقرير. تم حفظ جميع البيانات بنجاح وسيتم مراجعتها قريباً.');
        
        // Reset form data after a short delay
        setTimeout(() => {
          resetFormData();
          setHasUnsavedChanges(false);
        }, 1000);
        
        // Hide popup after 4 seconds
        setTimeout(() => {
          setShowSubmitPopup(false);
        }, 4000);
      } else if (actionData.success === false) {
        // Error case
        console.log("Error detected:", actionData.error);
        setSubmitStatus('error');
        setSubmitMessage(actionData.error || 'حدث خطأ أثناء إرسال التقرير. يرجى المحاولة مرة أخرى.');
      }
    }
  }, [actionData, showSubmitPopup, resetFormData]);

  // Fallback: If navigation becomes idle but we're still loading, assume success
  React.useEffect(() => {
    if (navigation.state === "idle" && showSubmitPopup && submitStatus === 'loading' && navigation.formMethod === "post") {
      console.log("Fallback success trigger - no action data but submission completed");
      setSubmitStatus('success');
      setSubmitMessage('تم إرسال التقرير بنجاح!');
      
      setTimeout(() => {
        resetFormData();
        setHasUnsavedChanges(false);
      }, 1000);
      
      setTimeout(() => {
        setShowSubmitPopup(false);
      }, 4000);
    }
  }, [navigation.state, navigation.formMethod, showSubmitPopup, submitStatus, resetFormData]);

  // Populate skills from API when component loads
  React.useEffect(() => {
    if (skills && Array.isArray(skills) && skills.length > 0) {
      console.log("Populating skills from API:", skills);
      
      // Transform API skills to match component format
      const apiSkills = skills.map((skill: any) => ({
        id: skill.id,
        label: skill.name,
        checked: false,
      }));

      // Distribute skills across 3 columns evenly
      const column1 = apiSkills.slice(0, Math.ceil(apiSkills.length / 3));
      const column2 = apiSkills.slice(Math.ceil(apiSkills.length / 3), Math.ceil(apiSkills.length * 2 / 3));
      const column3 = apiSkills.slice(Math.ceil(apiSkills.length * 2 / 3));
      
      setSkillsColumns([column1, column2, column3]);
      console.log("Skills columns populated:", [column1, column2, column3]);
    }
  }, [skills]); // Dependency on skills to run when skills are loaded

  return (
    <>
      {/* Submit Status Popup */}
      {showSubmitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md mx-4 transform transition-all duration-300 scale-100">
            {submitStatus === 'loading' && (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 [direction:rtl]">جاري الإرسال...</h3>
                <p className="text-gray-600 text-lg [direction:rtl] leading-relaxed">
                  يرجى الانتظار، جاري إرسال التقرير...
                </p>
              </>
            )}
            
            {submitStatus === 'success' && (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-3 [direction:rtl]">تم إرسال التقرير بنجاح!</h3>
                <p className="text-gray-600 text-lg [direction:rtl] leading-relaxed">
                  {submitMessage}
                </p>
                <button 
                  onClick={() => setShowSubmitPopup(false)}
                  className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  إغلاق
                </button>
              </>
            )}
            
            {submitStatus === 'error' && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-3 [direction:rtl]">فشل في إرسال التقرير</h3>
                <p className="text-gray-600 text-lg [direction:rtl] leading-relaxed">
                  {submitMessage}
                </p>
                <button 
                  onClick={() => setShowSubmitPopup(false)}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  إغلاق
                </button>
              </>
            )}
            
            {submitStatus !== 'loading' && submitStatus !== 'error' && (
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-green-500 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <form
        onSubmit={handleSendReport}
        className="flex flex-col w-full max-w-full overflow-hidden"
      >
      {/* Navigation Section - Only show if there's a message */}
      {latestMessage && (
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
              <div className="flex items-start gap-3 w-full">
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
                
                {/* Mark as seen button */}
                {latestMessage && !messageData.isRead && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-1 bg-blue-50 hover:bg-blue-100 rounded-full"
                    onClick={() => handleMarkAsRead(messageData.id)}
                    title="تحديد كمقروءة"
                  >
                    <CheckIcon className="h-4 w-4 text-blue-600" />
                  </Button>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${!messageData.isRead ? 'text-[#181d27]' : 'text-[#717680]'}`}>
                    {messageData.author}
                  </span>
                  <span className="text-sm text-[#717680] ">
                    {messageData.timeAgo}
                  </span>
                  {/* Unread indicator */}
                  {latestMessage && !messageData.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <p className={`text-sm ${!messageData.isRead ? 'text-[#414651] font-medium' : 'text-[#717680]'}`}>
                  {messageData.content}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                      typeof reportData[
                        card.field as keyof CreateReportData
                      ] === "number"
                        ? (reportData[
                            card.field as keyof CreateReportData
                          ] as number)
                        : ""
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
          <div className="flex w-full h-[50px] items-center justify-between px-2 py-1 bg-[#199491] rounded-[8px] mb-5">
            <h2 className="font-bold text-white text-2xl [direction:rtl]">
              انطباع الطالبات
            </h2>
            <Button
              variant="outline"
              type="button"
              className="flex w-[120px] items-center justify-center gap-1 px-3 py-2 bg-white rounded-md overflow-hidden border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
              onClick={handleAddOpinion}
            >
              <span className="relative w-fit font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                أضف
              </span>
            </Button>
          </div>

          {/* Review Opinions */}
          <div className="flex flex-col w-full gap-2">
            {opinions.map((opinion) => (
              <div key={opinion.id} className="w-full">
                <div
                  className={`flex items-center justify-between w-full p-3 h-[42px] rounded-lg cursor-pointer ${
                    activeTab === `opinion-${opinion.id}`
                      ? "bg-[#ebedf0]"
                      : "bg-[#f9f9f9]"
                  }`}
                  onClick={() => handleTabClick(opinion.id)}
                >
                  <div className="flex-1 w-full pr-2">
                    <span
                      className={`w-full font-bold ${
                        opinion.active ? "text-black" : "text-[#414651]"
                      } text-base leading-normal [direction:rtl] text-right block`}
                    >
                      {`رأي الطالبة ${opinion.title || "..."}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MinusCircleIcon
                      className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
                      onClick={(e) => handleDeleteOpinion(opinion.id, e)}
                    />
                  </div>
                </div>
                {/* Show textarea directly below the active tab */}
                {activeTab === `opinion-${opinion.id}` && (
                  <div className="w-full px-0 pt-3 pb-2">
                    <div className="mb-3">
                      <input
                        className="w-full font-bold text-black text-base leading-normal [direction:rtl] bg-white border border-[#d0d5dd] rounded-lg p-3 text-right"
                        placeholder="اسم المتدربة"
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
                    <Textarea
                      className="w-full text-right bg-white border border-[#d0d5dd] rounded-lg p-3 min-h-[100px] resize-none"
                      placeholder="رأي المتدربة"
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
          </div>
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
                  /{skillsColumns.flat().length} مهارات مختارة
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
          disabled={navigation.state === "submitting"}
          className="w-full bg-[#006173] text-white hover:bg-[#0a7285] h-[48px] disabled:opacity-50 transition-all duration-200"
        >
          {navigation.state === "submitting" ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري الإرسال...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>إرسال التقرير</span>
              <img src={sendicon} alt="" />
            </div>
          )}
        </Button>
      </div>
    </form>
    </>
  );
};

export default TrainerProfile;
