import {
  useNavigate,
  useActionData,
  useNavigation,
  useLoaderData,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { authClient } from "../../lib/auth.client";
import { getErrorMessage } from "../../lib/get-error-messege";
import LoadingOverlay from "~/components/loading-overlay";
import { toast as showToast } from "sonner";
import glossary from "./glossary";
import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { requireSpecialCase } from "~/lib/get-authenticated.server";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/UI-dashbord/checkbox";
import { Input } from "../../components/ui/input";
import group30525 from "../../assets/icons/square-arrow-login.svg";
import group1 from "../../assets/images/new-design/logo-login.svg";
import section from "../../assets/images/new-design/section.png";

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Test database connection and fetch sample users
  let dbConnectionStatus = { success: false, error: null, dbUrl: '' };
  let sampleUsers: Array<{ id: string; email: string; createdAt: Date; updatedAt: Date }> = [];
  
  try {
    const { client } = await import("~/db/db-client.server");
    const dbUrl = context.cloudflare.env.DATABASE_URL;
    dbConnectionStatus.dbUrl = dbUrl;
    
    const prisma = await client(dbUrl, context);
    if (prisma) {
      // Test connection
      await prisma.$queryRaw`SELECT 1 as connected`;
      
      // Fetch first 5 users (for debugging purposes)
      sampleUsers = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      await prisma.$disconnect();
      dbConnectionStatus.success = true;
    }
  } catch (error) {
    console.error("Database connection failed:", error);
    dbConnectionStatus.error = error instanceof Error ? error.message : "Unknown error";
  }

  const user = await requireSpecialCase(
    request,
    context,
    (user) => user === null
  );

  return { user, dbConnectionStatus, sampleUsers };
}

type ActionData = {
  errors?: {
    email?: string;
    password?: string;
    generic?: string;
  };
};

export default function Login() {
  const navigate = useNavigate();
  const { dbConnectionStatus, sampleUsers } = useLoaderData<typeof loader>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    // Log database connection status
    console.group("Database Connection Status");
    console.log("DB URL:", dbConnectionStatus.dbUrl);
    console.log("Connection successful:", dbConnectionStatus.success);
    if (!dbConnectionStatus.success) {
      console.error("Connection error:", dbConnectionStatus.error);
    }
    // console.groupEnd();

    // Log sample users from database
    if (sampleUsers && sampleUsers.length > 0) {
      // console.group("Sample Users from Database");
      console.table(sampleUsers);
      // console.groupEnd();
    } else {
      console.warn("No sample users found in database");
    }
  }, [dbConnectionStatus, sampleUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Basic validation
    if (!email) {
      setLoginError(glossary.login.errors.email.required);
      return;
    }
    if (!password) {
      setLoginError(glossary.login.errors.password.required);
      return;
    }

    // console.group("Login Attempt");
    // console.log("Email:", email);
    // console.log("Password length:", password);
    // console.groupEnd();

    try {
      setLoading(true);
      
      const authResponse = await authClient.signIn.email(
        { email, password },
        {
          onRequest: () => {
            console.log("Authentication request started");
          },
          onSuccess: (ctx) => {
            console.group("Authentication Success");
            console.log("User ID:", ctx.user?.id);
            console.log("Session created:", !!ctx.session);
            console.groupEnd();
            
            setLoading(false);
            navigate("/");
          },
          onError: (ctx) => {
            console.group("Authentication Error");
            console.error("Error code:", ctx.error.code);
            console.error("Error message:", ctx.error.message);
            console.error("Full error object:", ctx.error);
            console.groupEnd();

            setLoading(false);

            if (ctx.error.code === "EMAIL_IS_NOT_VERIFIED_CHECK_YOUR_EMAIL_FOR_A_VERIFICATION_LINK") {
              showToast.error(glossary.login.errors.unverified);
            } else if (ctx.error.code === "FAILED_TO_CREATE_SESSION") {
              showToast.error(glossary.signup.toasts.signupError.title, {
                description: glossary.signup.toasts.signupError.sessionFailure,
              });
            } else {
              showToast.error(glossary.login.errors.invalid);
            }

            setLoginError(getErrorMessage(ctx.error));
          },
        }
      );
    } catch (error) {
      console.group("Unexpected Login Error");
      console.error("Error:", error);
      console.groupEnd();

      setLoading(false);
      setLoginError("An unexpected error occurred. Please try again.");
      showToast.error("Login failed", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <div className="bg-white flex h-screen w-full">
      {/* Left side background image - hidden on mobile */}
      <div className="flex w-5/12 relative max-md:hidden">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${section})`,
          }}
        />
      </div>

      {/* Right side content - full width on mobile */}
      <div className="flex flex-col w-full md:w-7/12 h-full items-center justify-center px-4">
        <div className="flex flex-col max-w-[360px] w-full">
          {/* Back button with top margin */}
          <div className="w-full mb-8">
            {loading && <LoadingOverlay message="جاري التحميل" />}
            <button
              onClick={() => navigate("/")}
              className="button font-bold text-center text-xs md:text-sm md:p-3 rounded-lg text-gray-700 hover:bg-black/5 transition-all"
            >
              <img className="w-[25px] h-[25px]" alt="Group" src={group30525} />
            </button>
          </div>

          {/* Header section */}
          <header className="flex flex-col items-center gap-6 w-full mb-10">
            <div className="relative w-[94px] h-[60px] mb-4">
              <img
                className="absolute w-[94px] h-[60px] left-7"
                alt="Logo part 2"
                src={group1}
              />
            </div>

            <div className="flex flex-col items-center gap-3 w-full">
              <h1 className="w-full font-bold text-[#181d27] text-3xl text-center leading-6 [direction:rtl] tracking-[0]">
                تسجيل الدخول إلى حسابك
              </h1>
              <p className="w-full font-medium text-[#535861] text-base text-center tracking-[0] leading-6 [direction:rtl]">
                مرحبا بعودتك! يرجى إدخال البيانات
              </p>
            </div>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <Card className="w-full border-none shadow-none">
              <CardContent className="p-0 space-y-6">
                {/* Email field */}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-end gap-0.5">
                    <label className="font-medium text-[#414651] text-sm text-right tracking-[0] leading-6 [direction:rtl]">
                      البريد الإلكتروني
                    </label>
                    <span className="text-[#286456] text-sm">*</span>
                  </div>
                  <Input
                    className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs text-right [direction:rtl]"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password field */}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-end gap-0.5">
                    <label className="font-medium text-[#414651] text-sm text-right tracking-[0] leading-6 [direction:rtl]">
                      كلمة المرور
                    </label>
                    <span className="text-[#286456] text-sm">*</span>
                  </div>
                  <Input
                    type="password"
                    className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs text-right [direction:rtl]"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Error message */}
                {loginError && (
                  <p className="w-full font-normal text-[#d92c20] text-sm tracking-[0] leading-5 [direction:rtl] text-right">
                    {loginError}
                  </p>
                )}

                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between w-full pt-2">
                  <button
                    type="button"
                    className="font-medium text-[#414651] text-sm leading-5 [direction:rtl]"
                  >
                    نسيت كلمة المرور
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#414651] text-sm leading-5 [direction:rtl]">
                      تذكر لمدة 30 يوما
                    </span>
                    <Checkbox className="w-4 h-4 rounded border border-solid border-[#d5d6d9]" />
                  </div>
                </div>

                {/* Login button */}
                <div className="w-full pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-[#006A61] hover:bg-[#005A51] text-white rounded-lg py-2.5 font-medium text-base [direction:rtl]"
                    disabled={loading || isSubmitting}
                  >
                    {loading || isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}