import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { useEffect, useState } from "react";
import { toast as showToast } from "sonner";
import { ChevronDownIcon, MailIcon } from "lucide-react";
import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcryptjs";

// Components
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
import LoadingOverlay from "~/components/loading-overlay";
import { v4 as uuidv4 } from "uuid"; // For UUID generation
// Utilities
import {
  getAuthenticatedUser,
  redirectIfAuthenticated,
} from "../../lib/auth.server";
import { getSession, commitSession } from "../../utils/session.server";
import { getPrismaClient } from "../../db/db-client.server";

// Assets
import registerLogo from "~/assets/images/new-design/logo-login.svg";
import arrowLeft from "~/assets/icons/square-arrow-login.svg";
import arrowregister from "~/assets/icons/arrow-White.svg";

// Types
import type { Region, School, EduAdmin } from "@prisma/client";
import { authClient } from "~/lib/auth.client";
import glossary from "./glossary";
import { useSubmit } from "@remix-run/react";


export async function loader({ request, context }: LoaderFunctionArgs) {
  // Redirect if user is already authenticated
  await redirectIfAuthenticated(request, context);

  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const prisma = await getPrismaClient(dbUrl, context);

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as connected`;

    // Fetch data in parallel
    const [regions, eduAdmins, schools] = await Promise.all([
      prisma.region.findMany({ orderBy: { name: "asc" } }),
      prisma.eduAdmin.findMany({
        include: { region: true, schools: true },
        orderBy: { name: "asc" },
      }),
      prisma.school.findMany({
        include: { eduAdmin: { include: { region: true } } },
        orderBy: { name: "asc" },
      }),
    ]);

    return json({ regions, eduAdmins, schools });
  } catch (error) {
    console.error("Database error:", error);
    return json(
      {
        regions: [],
        eduAdmins: [],
        schools: [],
        error: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
export const action = async ({ request, context }: ActionFunctionArgs) => {
  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const prisma = await getPrismaClient(dbUrl, context);


  const formData = await request.formData();
  // Extract form data
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as string;
  const region = formData.get("region") as string;
  const eduAdminName = formData.get("eduAdmin") as string;
  const schoolName = formData.get("school") as string;

  console.log("All schools:", await prisma.school.findMany());
  console.log("All eduAdmins:", await prisma.eduAdmin.findMany());
  console.log("Form data:", {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    region: formData.get("region"),
    eduAdmin: formData.get("eduAdmin"),
    school: formData.get("school"),
  });

  // Validate required fields
  // const requiredFields = [
  //   "name", "email", "password", "passwordConfirmation",
  //   phone, "region", "eduAdmin", "school"
  // ];

  // for (const field of requiredFields) {
  //   if (!formData.get(field)) {
  //     return json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  //   }
  // }

  // Validate password match
  // if (password !== passwordConfirmation) {
  //   return json({ error: "كلمات المرور غير متطابقة" }, { status: 400 });
  // }

  // Validate password length
  // if (password.length < 8) {
  //   return json(
  //     { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" },
  //     { status: 400 }
  //   );
  // }

  // Validate phone number format
  // const phoneRegex = /^(009665|9665|\+9665|05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;
  // if (!phoneRegex.test(phone)) {
  //   return json({ error: "رقم الجوال غير صالح" }, { status: 400 });
  // }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return json({ error: "البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });
  }
  try {
    // Find related records by name
    const schoolRecord = await prisma.school.findFirst({
      where: { name: schoolName },
    });
    const eduAdminRecord = await prisma.eduAdmin.findFirst({
      where: { name: eduAdminName },
    });

    if (!schoolRecord) {
      throw new Error(`School not found: ${schoolName}`);
    }
    if (!eduAdminRecord) {
      throw new Error(`EduAdmin not found: ${eduAdminName}`);
    }

    // Create user with proper relation IDs
    const user = await prisma.user.create({
      data: {
        id: uuidv4(), // Generate a unique ID
        name,
        email,
        phone: Number(phone),
        role,
        schoolId: schoolRecord.id, // Use ID, not name
        region,
        eduAdminId: eduAdminRecord.id, // Use ID, not name
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create session
    const session = await getSession(request.headers.get("Cookie"));
    session.set("userId", user.id);

    return redirect("/login", {
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
  const [phone, setPhone] = useState("+966 (555) 000-0000");
  const [email, setEmail] = useState("Kmsalms@gmail.com");
  const [name, setName] = useState("خالد محمد المسلم");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [region, setRegion] = useState("الرياض");
  const [cv, setCv] = useState<File | null>(null);
  // const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const submit = useSubmit();
  const [loading, setLoading] = useState(false);

  const actionData = useActionData<ActionData>();

  const navigate = useNavigate();
  const navigation = useNavigation();
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedEduAdmin, setSelectedEduAdmin] = useState<string>("");
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [touched, setTouched] = useState<{
    school?: boolean;
    email?: boolean;
    password?: boolean;
    passwordConfirmation?: boolean;
    name?: boolean;
    phone?: boolean;
    cv?: boolean;
    // bio?: boolean;
    role?: boolean;
    eduAdmin?: boolean;
    region?: boolean;
  }>({ school: false });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    passwordConfirmation?: string;
    name?: string;
    phone?: string;
    region?: string;
    school?: string;
  }>({});
  // Get data from loader
  const loaderData = useLoaderData<typeof loader>();
  const regions = loaderData.regions || [];
  const eduAdmins = loaderData.eduAdmins || [];

  // Update schools when education admin changes
  useEffect(() => {
    if (selectedEduAdmin) {
      const admin = eduAdmins.find((a) => a.name === selectedEduAdmin);
      setSchools(
        (admin?.schools || []).map((school: any) => ({
          ...school,
          createdAt: new Date(school.createdAt),
          updatedAt: new Date(school.updatedAt),
        }))
      );
    } else {
      setSchools([]);
    }
    setSelectedSchool(""); // Reset school selection
  }, [selectedEduAdmin, eduAdmins]);

  // Reset downstream selections when region changes
  useEffect(() => {
    setSelectedEduAdmin("");
    setSelectedSchool("");
    setSchools([]);
  }, [selectedRegion]);

  // Validation logic (assuming you're using formik or similar)

  useEffect(() => {
    // ... existing validation logic
    const newErrors: typeof errors = {};
    if (touched.school && !selectedSchool) {
      newErrors.school = "يرجى اختيار المدرسة";
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
  }, [touched, selectedSchool]);

  interface ActionData {
    success?: boolean;
    key?: string;
    error?: string;
  }
  useEffect(() => {
    const handleSigneup = async () => {
      if (actionData?.success && actionData?.key) {
        try {
          await authClient.signUp.email(
            {
              email,
              password: createId(),
              name,
              // bio,
              cvKey: actionData.key,
              phone: Number(phone),
              region,
              acceptenceState: "pending",
              role: "",
            },
            {
              onRequest: (ctx) => {
                setLoading(true);

                // show loading state
              },
              onSuccess: async (ctx) => {
                setLoading(false);

                showToast.success(glossary.signup.toasts.verifyEmail.title, {
                  description: glossary.signup.toasts.verifyEmail.description,
                });
              },
              onError: (ctx) => {
                setLoading(false);

                if (
                  ctx.error.code === "USER_WITH_THIS_EMAIL_ALREADY_EXISTS" ||
                  ctx.error.code === "USER_ALREADY_EXISTS"
                ) {
                  showToast.error(glossary.signup.toasts.signupError.title, {
                    description: glossary.signup.toasts.signupError.emailExist,
                  });
                } else {
                  showToast.error(glossary.signup.toasts.signupError.title, {
                    description:
                      glossary.signup.toasts.signupError.generalDescription,
                  });
                }
              },
            }
          );
        } catch (e) {
          showToast.error(glossary.signup.toasts.signupError.title, {
            description: e instanceof Error ? e.message : String(e),
          });
        }
      } else if (actionData?.error) {
        showToast.error(glossary.signup.toasts.signupError.title, {
          description: actionData.error,
        });
      }
    };
    handleSigneup();
  }, [actionData]);

  // Add function to check if all required fields are filled
  // Add this useEffect to validate form
  useEffect(() => {
    const isValid =
      name.trim() !== "" &&
      phone.trim() !== "" &&
      email.trim() !== "" &&
      role.trim() !== "" &&
      selectedRegion.trim() !== "" &&
      selectedEduAdmin.trim() !== "" &&
      selectedSchool.trim() !== "" &&
      password.trim() !== "" &&
      passwordConfirmation.trim() !== "" &&
      password === passwordConfirmation;

    setIsFormValid(isValid);
  }, [
    name,
    phone,
    email,
    role,
    selectedRegion,
    selectedEduAdmin,
    selectedSchool,
    password,
    passwordConfirmation,
  ]);
  const validateForm = (touchedFields = touched) => {
    const newErrors: typeof errors = {};
    const g = glossary.signup.validationErrors;

    if (touchedFields.name && !name.trim()) {
      newErrors.name = g.name;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (touchedFields.email) {
      if (!email) {
        newErrors.email = g.email.required;
      } else if (!emailRegex.test(email)) {
        newErrors.email = g.email.invalid;
      }
    }

    if (touchedFields.password) {
      if (!password) {
        newErrors.password = g.password.required;
      } else if (password.length < 8) {
        newErrors.password = g.password.length;
      }
    }

    if (
      touchedFields.passwordConfirmation &&
      password !== passwordConfirmation
    ) {
      newErrors.passwordConfirmation = g.passwordConfirmation;
    }

    if (touchedFields.phone) {
      if (!phone || phone == "") {
        newErrors.phone = g.phone.required;
      } else if (phone.length === 12 && !phone.startsWith("966")) {
        newErrors.phone = g.phone.saudi;
      } else if (phone.length === 10 && !phone.startsWith("05")) {
        newErrors.phone = g.phone.notValid;
      } else if (!(phone.length === 10)) {
        newErrors.phone = g.phone.length_10;
      }
    }
    // if (touchedFields.region && !selectedRegion) {
    //   newErrors.region = g.region;
    // }

    // if (touchedFields.eduAdmin && !selectedEduAdmin) {
    //   newErrors.eduAdmin = g.eduAdmin;
    // }

    // if (touchedFields.school && !selectedSchool) {
    //   newErrors.school = g.school;
    // }

    // if (touchedFields.role && !role) {
    //   newErrors.role = g.role;
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Update useEffect for form validation
  useEffect(() => {
    if (Object.values(touched).some(Boolean)) {
      const isValid = validateForm();
      // const areFieldsFilled = areAllFieldsFilled();
      // setIsFormValid(isValid && areFieldsFilled);
    } else {
      setIsFormValid(false); // Ensure button is disabled initially
    }
  }, [email, name, phone, cv]);

  useEffect(() => {
    if (actionData?.error) {
      setLoading(false);
      showToast.error("Registration Failed", {
        description: actionData.error,
      });
    }
  }, [actionData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Create FormData and append all fields
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("passwordConfirmation", passwordConfirmation);
    formData.append("phone", phone || "");
    // formData.append("bio", bio);
    formData.append("region", selectedRegion);
    formData.append("eduAdmin", selectedEduAdmin);
    formData.append("school", selectedSchool);
    formData.append("role", role);

    if (cv) {
      formData.append("cv", cv);
    }

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
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-8"
          >
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="justify-end gap-2 px-[10px] py-[14px] text-[#717680] bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]"
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
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 font-normal h-11 px-[10px] py-[14px] text-[#717680] text-base text-right border-0 rounded-md   border-input shadow-none p-0"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 font-normal h-11 text-[#717680] text-base text-right border-0 shadow-none p-0"
                  />
                </div>
              </div>

              {/* Role selection toggle */}
              <ToggleGroup
                type="single"
                value={role}
                onValueChange={(value) => value && setRole(value)}
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
                <Select
                  name="region"
                  value={selectedRegion}
                  onValueChange={setSelectedRegion} // Make sure this updates state
                >
                  <SelectTrigger className="justify-end gap-2 px-3.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]">
                    {/* Fixed: Use selectedRegion instead of region */}
                    <div className="flex-1 text-start font-normal text-[#717680] text-base">
                      {selectedRegion || "اختر المنطقة"}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {regions.map((reg: any) => (
                        <SelectItem
                          key={reg.id}
                          className={`${
                            selectedRegion === reg.name ? "bg-gray-50" : ""
                          }`}
                          value={reg.name}
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
                  value={selectedEduAdmin}
                  onValueChange={setSelectedEduAdmin}
                  disabled={!selectedRegion}
                >
                  <SelectTrigger className="justify-end gap-2 px-3.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]">
                    <div className="flex-1 text-start font-normal text-[#717680] text-base">
                      {selectedEduAdmin || "اختر الإدارة التعليمية"}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {eduAdmins.map((admin: any) => (
                        <SelectItem
                          key={admin.id}
                          className={`${
                            selectedEduAdmin === admin.name ? "bg-gray-50" : ""
                          }`}
                          value={admin.name}
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
                  value={selectedSchool}
                  onValueChange={setSelectedSchool}
                  disabled={!selectedEduAdmin}
                >
                  <SelectTrigger className="justify-end gap-2 px-3.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs [direction:rtl]">
                    <div className="flex-1 text-start font-normal text-[#717680] text-base">
                      {selectedSchool ||
                        (schools.length
                          ? "اختر المدرسة"
                          : "لا توجد مدارس متاحة")}
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-64 [direction:rtl]">
                    <SelectGroup>
                      {schools.map((s) => (
                        <SelectItem
                          key={s.id}
                          className={`${
                            selectedSchool === s.name ? "bg-gray-50" : ""
                          }`}
                          value={s.name}
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Real-time validation
                    if (e.target.value.length < 8) {
                      setErrors({
                        ...errors,
                        password: "Password must be at least 8 characters",
                      });
                    } else {
                      setErrors({ ...errors, password: "" });
                    }
                  }}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              {/* <div className="flex flex-col gap-1.5">
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
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  // ... other props
                />
                {errors.passwordConfirmation && (
                  <p className="text-red-500 text-sm">
                    {errors.passwordConfirmation}
                  </p>
                )}
              </div> */}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || loading}
           className="max-md:mt-[20px] mb-3 md:mt-[90px] bg-[#006E7F] hover:bg-[#005a68] text-white rounded-lg [direction:rtl] font-bold text-base py-3" >
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
          backgroundImage: "url(app/assets/images/new-design/section.png)",
        }}
      />
    </div>
  );
}
