import { AlertCircleIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Checkbox } from "./components/ui/checkbox";
import { Input } from "./components/ui/input";
import { useNavigate, useNavigation } from "@remix-run/react";
import LoadingOverlay from "~/components/loading-overlay";
import { authClient } from "../../../lib/auth.client";
import { toast as showToast } from "sonner";
import glossary from "../glossary";
import group30525 from "../../../assets/images/new-design/login/group-30525.png";
import group from "../../../assets/images/new-design/login/group.png";
import group1 from "../../../assets/images/new-design/login/group-1.png";
import section from "../../../assets/images/new-design/login/section.png";

export const NewLogin = (): JSX.Element => {
  const navigate = useNavigate();
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    try {
      await authClient.signIn.email(
        { email, password },
        {
          onRequest: () => {
            setLoading(true);
          },
          onSuccess: () => {
            setLoading(false);
            navigate("/");
          },
          onError: (ctx) => {
            setLoading(false);

            if (
              ctx.error.code ===
              "EMAIL_IS_NOT_VERIFIED_CHECK_YOUR_EMAIL_FOR_A_VERIFICATION_LINK"
            ) {
              showToast.error(glossary.login.errors.unverified);
            } else if (ctx.error.code === "FAILED_TO_CREATE_SESSION") {
              showToast.error(glossary.signup.toasts.signupError.title, {
                description: glossary.signup.toasts.signupError.sessionFailure,
              });
            } else {
              showToast.error(glossary.login.errors.invalid);
            }

            const errorMessage = ctx.error.message || "Unknown error occurred";
            console.error("Login error:", errorMessage);
          },
        }
      );
    } catch (error) {
      setLoading(false);
      setLoginError("An unexpected error occurred. Please try again.");
      console.error("Login failed:", error);
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
      
      {/* Header section with consistent margins */}
      <header className="flex flex-col items-center gap-6 w-full mb-10">
        <div className="relative w-[94px] h-[60px] mb-4">
          <img
            className="absolute w-[33px] h-8 top-0 left-0"
            alt="Logo part 1"
            src={group}
          />
          <img
            className="absolute w-[66px] h-[31px] top-[29px] left-7"
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

      {/* Form with aligned inputs and consistent spacing */}
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
              <button type="button" className="font-medium text-[#414651] text-sm leading-5 [direction:rtl]">
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
              >
                تسجيل الدخول
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  </div>
</div>
  );
};
