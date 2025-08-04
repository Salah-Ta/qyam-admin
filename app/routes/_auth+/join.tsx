import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { useEffect, useState } from "react";
import { ChevronDownIcon, MailIcon } from "lucide-react";
import bcrypt from "bcryptjs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
} from "~/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { v4 as uuidv4 } from "uuid";
import { getSession, commitSession } from "../../utils/session.server";
import { redirectWithToast } from "~/lib/toast.server";
import { getPrismaClient } from "../../db/db-client.server";
import registerLogo from "~/assets/images/new-design/logo-login.svg";
import arrowLeft from "~/assets/icons/square-arrow-login.svg";
import arrowregister from "~/assets/icons/arrow-White.svg";
import regionDB from "~/db/region/region.server";
import eduAdminDB from "~/db/eduAdmin/eduAdmin.server";
import schoolDB from "~/db/school/school.server";
import section from "../../assets/images/new-design/section.png";
import { sendEmail } from "~/lib/send-email.server";
import glossary from "~/lib/glossary";

// Define interfaces for the location data
interface EntityItem {
  id: string;
  name: string;
  regionId?: string; // For eduAdmin items
  eduAdminId?: string; // For school items
}

// --- Helper: Validation ---
function validateSignup({
  name,
  phone,
  email,
  role,
  region,
  eduAdmin,
  school,
  password,
  passwordConfirmation,
}: {
  name: string;
  phone: string;
  email: string;
  role: string;
  region: string;
  eduAdmin: string;
  school: string;
  password: string;
  passwordConfirmation: string;
}) {
  const errors: { [key: string]: string } = {};
  if (!name.trim()) errors.name = "يرجى إدخال الاسم الرباعي";
  if (!phone.trim()) errors.phone = "يرجى إدخال رقم الجوال";
  if (!email.trim()) errors.email = "يرجى إدخال البريد الإلكتروني";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "البريد الإلكتروني غير صالح";
  if (!role) errors.role = "يرجى اختيار الدور";
  if (!region) errors.region = "يرجى اختيار المنطقة";
  if (!eduAdmin) errors.eduAdmin = "يرجى اختيار الإدارة التعليمية";
  if (!school) errors.school = "يرجى اختيار المدرسة";
  if (!password) errors.password = "يرجى إدخال كلمة المرور";
  else if (password.length < 8)
    errors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
  if (!passwordConfirmation)
    errors.passwordConfirmation = "يرجى تأكيد كلمة المرور";
  else if (password !== passwordConfirmation)
    errors.passwordConfirmation = "كلمات المرور غير متطابقة";
  return errors;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  // await redirectIfAuthenticated(request, context);

  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const [regions, eduAdmins, schools] = await Promise.all([
    regionDB.getAllRegions(dbUrl),
    eduAdminDB.getAllEduAdmins(dbUrl),
    schoolDB.getAllSchools(dbUrl),
  ]);

  return json({
    regions: regions.data || [],
    eduAdmins: eduAdmins.data || [],
    schools: schools.data || [],
  });
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const prisma = await getPrismaClient(dbUrl, context);
  const formData = await request.formData();
  const fields = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    role: formData.get("role") as string,
    region: formData.get("region") as string,
    eduAdmin: formData.get("eduAdmin") as string,
    school: formData.get("school") as string,
    password: formData.get("password") as string,
    passwordConfirmation: formData.get("passwordConfirmation") as string,
  };
  const errors = validateSignup(fields);
  if (Object.keys(errors).length > 0) {
    return json({ error: Object.values(errors)[0] }, { status: 400 });
  }
  const phoneRegex = /^(009665|9665|\+9665|05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;
  if (!phoneRegex.test(fields.phone)) {
    return json({ error: "رقم الجوال غير صالح" }, { status: 400 });
  }
  const existingUser = await prisma.user.findUnique({
    where: { email: fields.email },
  });
  if (existingUser) {
    console.log("Found existing user with email:", fields.email, "User ID:", existingUser.id);
    return json({ error: "البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });
  }
  try {
    const hashedPassword = await bcrypt.hash(fields.password, 10);
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name: fields.name,
        email: fields.email,
        phone: Number(fields.phone),
        role: fields.role,
        schoolId: fields.school, // This will be the school name now
        region: fields.region,
        eduAdminId: fields.eduAdmin, // This will be the eduAdmin name now
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        acceptenceState: "pending", // Always set to pending
        cvKey: "1738215328438-l1sxndp1tiiyrxvc0hmgkqgl.uploaded-file",
      },
    });

    // Send registration email
    try {
      const emailConfig = {
        resendApi: context.cloudflare.env.RESEND_API || "",
        mainEmail: context.cloudflare.env.MAIN_EMAIL || "",
      };

      await sendEmail({
        to: user.email,
        subject: glossary.email.program_status_subject,
        template: "user-registration",
        props: { name: user.name },
        text: '',
      }, emailConfig.resendApi, emailConfig.mainEmail);

      console.log("✅ Registration email sent successfully to:", user.email);
    } catch (emailError) {
      console.error("❌ Failed to send registration email:", emailError);
      // Don't fail the registration if email fails
    }

    const session = await getSession(request.headers.get("Cookie"));
    session.set("userId", user.id);
    
    return redirectWithToast("/login", {
      type: "success",
      title: "تم التسجيل بنجاح!",
      description: "تم استلام طلبك بنجاح. يرجى متابعة بريدك الإلكتروني لمعرفة حالة الطلب قريباً"
    }, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.error("User creation failed:", error);
    return json(
      {
        error: "حدث خطأ أثناء التسجيل",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};

export default function Signup() {
  // Group form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "user",
    password: "",
    passwordConfirmation: "",
    region: "",
    eduAdmin: "",
    school: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const actionData = useActionData<{ error?: string }>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const loaderData = useLoaderData<typeof loader>();
  const { regions, eduAdmins, schools } = loaderData;

  // Filter eduAdmins based on selected region
  const filteredEduAdmins = eduAdmins.filter(
    (eduAdm: any) => eduAdm.regionId === form.region
  );

  // Filter schools based on selected eduAdmin
  const filteredSchools = schools.filter(
    (sch: any) => sch.eduAdminId === form.eduAdmin
  );

  // Reset eduAdmin and school when region changes
  useEffect(() => {
    setForm((f) => ({ ...f, eduAdmin: "", school: "" }));
  }, [form.region]);
  useEffect(() => {
    setForm((f) => ({ ...f, school: "" }));
  }, [form.eduAdmin]);

  useEffect(() => {
    const validationErrors = validateSignup(form);
    setErrors(validationErrors);
    setIsFormValid(Object.keys(validationErrors).length === 0);
  }, [form]);

  useEffect(() => {
    if (actionData?.error) {
      setLoading(false);
      // Error handling - the toast will be shown by the error response
    }
  }, [actionData]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    // Get the selected region, eduAdmin, and school names
    const selectedRegion = (regions as any[]).find(
      (r: any) => r.id === form.region
    );
    const selectedEduAdmin = (filteredEduAdmins as any[]).find(
      (ea: any) => ea.id === form.eduAdmin
    );
    const selectedSchool = (filteredSchools as any[]).find(
      (s: any) => s.id === form.school
    );

    // Set form data with names instead of IDs
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("role", form.role);
    formData.append("region", selectedRegion?.name || "");
    formData.append("eduAdmin", selectedEduAdmin?.name || "");
    formData.append("school", selectedSchool?.name || "");
    formData.append("password", form.password);
    formData.append("passwordConfirmation", form.passwordConfirmation);

    submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  };

  return (
    <div className="bg-white flex h-screen w-full overflow-hidden [direction:rtl]">
      {/* Logo section */}

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
              <img className="" alt="Group" src={arrowLeft} />
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
          <Form
            method="post"
            onSubmit={handleFormSubmit}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col md:flex-row gap-8">
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
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    className="justify-end gap-2 px-[10px] py-[14px] text-[#717680] bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]"
                  />
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
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
                      name="phone"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="flex-1 font-normal h-11 px-[10px] py-[14px] text-[#717680] text-base text-right border-0 rounded-md bg-white border-input shadow-none p-0"
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
                      name="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="flex-1 font-normal h-11 bg-white text-[#717680] text-base text-right border-0 shadow-none p-0"
                    />
                  </div>
                </div>

                {/* Role selection toggle */}
                <div className="flex flex-col gap-1.5">
                  <div className="inline-flex items-start gap-0.5">
                    <div className="text-[#1C81AC]">*</div>
                    <div className="font-medium text-[#414651] text-sm tracking-[0] leading-5">
                      الدور
                    </div>
                  </div>
                  <ToggleGroup
                    type="single"
                    value={form.role}
                    onValueChange={(value) =>
                      value && handleChange("role", value)
                    }
                    className="flex h-11 items-center justify-center gap-0.5 bg-neutral-50 rounded-lg border border-solid border-[#e9e9eb]"
                  >
                    <ToggleGroupItem
                      value="supervisor"
                      className="flex h-11 items-center justify-center gap-2 px-3 py-2 relative flex-1 grow rounded-lg overflow-hidden data-[state=off]:bg-transparent data-[state=on]:bg-white data-[state=on]:border data-[state=on]:border-solid data-[state=on]:border-[#d5d6d9] data-[state=on]:shadow-shadows-shadow-xs"
                    >
                      <div className="w-fit font-bold text-[#414651] text-base text-left whitespace-nowrap [direction:rtl] relative tracking-[0] leading-6">
                        مشرف
                      </div>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="user"
                      className="flex h-11 items-center justify-center gap-2 px-3 py-2 relative flex-1 grow rounded-lg overflow-hidden data-[state=off]:bg-transparent data-[state=on]:bg-white data-[state=on]:border data-[state=on]:border-solid data-[state=on]:border-[#d5d6d9] data-[state=on]:shadow-shadows-shadow-xs"
                    >
                      <div className="w-fit font-bold text-[#717680] text-base text-left whitespace-nowrap [direction:rtl] relative tracking-[0] leading-6 data-[state=on]:text-[#414651]">
                        مدرب
                      </div>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
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
                  <Select
                    name="region"
                    value={form.region}
                    onValueChange={(value) => handleChange("region", value)} // Make sure this updates state
                  >
                    <SelectTrigger className="justify-end gap-2 px-3.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]">
                      {/* Fixed: Use selectedRegion instead of region */}
                      <div className="flex-1 text-start font-normal text-[#717680] text-base">
                        {form.region
                          ? (regions as any[]).find(
                              (r: any) => r.id === form.region
                            )?.name
                          : "اختر المنطقة"}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {regions.map((reg: any) => (
                          <SelectItem
                            key={reg.id}
                            className={`${
                              form.region === reg.id ? "bg-gray-50" : ""
                            }`}
                            value={reg.id}
                          >
                            {reg.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Education Department Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="inline-flex items-start gap-0.5">
                    <div className="text-[#1C81AC]">*</div>
                    <div className="font-medium text-[#414651] text-sm tracking-[0] leading-5">
                      الإدارة التعليمية
                    </div>
                  </div>
                  <Select
                    name="eduAdmin"
                    value={form.eduAdmin}
                    onValueChange={(value) => handleChange("eduAdmin", value)}
                    disabled={!form.region}
                  >
                    <SelectTrigger className="justify-end gap-2 px-3.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]">
                      <div className="flex-1 text-start font-normal text-[#717680] text-base">
                        {form.eduAdmin
                          ? (filteredEduAdmins as any[]).find(
                              (ea: any) => ea.id === form.eduAdmin
                            )?.name
                          : "اختر الإدارة التعليمية"}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {filteredEduAdmins.map((admin: any) => (
                          <SelectItem
                            key={admin.id}
                            className={`${
                              form.eduAdmin === admin.id ? "bg-gray-50" : ""
                            }`}
                            value={admin.id}
                          >
                            {admin.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
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
                  <Select
                    name="school"
                    value={form.school}
                    onValueChange={(value) => handleChange("school", value)}
                    disabled={!form.eduAdmin}
                  >
                    <SelectTrigger className="justify-end gap-2 px-3.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]">
                      <div className="flex-1 text-start font-normal text-[#717680] text-base">
                        {form.school
                          ? (filteredSchools as any[]).find(
                              (s: any) => s.id === form.school
                            )?.name
                          : filteredSchools.length
                          ? "اختر المدرسة"
                          : "لا توجد مدارس متاحة"}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-64 [direction:rtl]">
                      <SelectGroup>
                        {filteredSchools.map((s: any) => (
                          <SelectItem
                            key={s.id}
                            className={`${
                              form.school === s.id ? "bg-gray-50" : ""
                            }`}
                            value={s.id}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#181d27] text-base">
                                {s.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="inline-flex items-start gap-0.5">
                    <div className="text-[#1C81AC]">*</div>
                    <div className="font-medium text-[#414651] text-sm">
                      كلمة المرور
                    </div>
                  </div>
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                  />
                  {touched.password && errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="inline-flex items-start gap-0.5">
                    <div className="text-[#1C81AC]">*</div>
                    <div className="font-medium text-[#414651] text-sm">
                      تأكيد كلمة المرور
                    </div>
                  </div>
                  <Input
                    type="password"
                    name="passwordConfirmation"
                    placeholder="••••••••"
                    value={form.passwordConfirmation}
                    onChange={(e) =>
                      handleChange("passwordConfirmation", e.target.value)
                    }
                    onBlur={() => handleBlur("passwordConfirmation")}
                  />
                  {touched.passwordConfirmation &&
                    errors.passwordConfirmation && (
                      <p className="text-red-500 text-sm">
                        {errors.passwordConfirmation}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="max-md:mt-[20px] mb-3 md:mt-[90px] bg-[#006E7F] hover:bg-[#005a68] text-white rounded-lg [direction:rtl] font-bold text-base py-3"
            >
              {loading ? "جاري التسجيل..." : "تسجيل"}
              <img src={arrowregister} alt="arrow-left" className="ml-2" />
            </Button>

            {/* Display action errors */}
            {actionData?.error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {actionData.error}
              </div>
            )}
          </Form>
        </div>

        {/* Right image section */}
      </div>

      <div
        className=" lg:block w-5/12  max-lg:hidden h-full bg-no-repeat bg-cover"
        style={{
            backgroundImage: `url(${section})`,
          }}
      />
    </div>
    
  );
}
