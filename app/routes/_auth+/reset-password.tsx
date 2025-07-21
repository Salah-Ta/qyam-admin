import { useNavigate, useNavigation } from "@remix-run/react";
import React, { useState } from "react";
import { authClient } from "../../lib/auth.client";
import { getErrorMessage } from "../../lib/get-error-messege";
import LoadingOverlay from "~/components/loading-overlay";
import { toast as showToast } from "sonner";
import glossary from "./glossary";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import group30525 from "../../assets/icons/square-arrow-login.svg";
import group1 from "../../assets/images/new-design/logo-login.svg";
import section from "../../assets/images/new-design/section.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    
    if (password !== confirmedPassword) {
      setResetError(glossary.resetPassword.toast.passwordMismatch);
      return;
    }

    if (!password) {
      setResetError("كلمة المرور مطلوبة");
      return;
    }

    try {
      setLoading(true);

      await authClient.resetPassword(
        {
          newPassword: password,
        },
        {
          onRequest: () => {
            console.log("Password reset request started");
          },
          onSuccess: () => {
            setLoading(false);
            showToast.success("تم تغيير كلمة المرور", {
              description: glossary.resetPassword.toast.success,
            });
            navigate("/");
          },
          onError: (error) => {
            setLoading(false);
            const msg = getErrorMessage(error);
            showToast.error("خطأ في تغيير كلمة المرور", {
              description: glossary.resetPassword.toast.error,
            });
            setResetError(msg);
            console.log("msg error in reset password", error);
          },
        }
      );
    } catch (error) {
      setLoading(false);
      setResetError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      showToast.error("فشل في تغيير كلمة المرور", {
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
              onClick={() => navigate("/login")}
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
                {glossary.resetPassword.title}
              </h1>
              <p className="w-full font-medium text-[#535861] text-base text-center tracking-[0] leading-6 [direction:rtl]">
                أدخل كلمة المرور الجديدة وتأكيدها لإتمام عملية إعادة التعيين
              </p>
            </div>
          </header>

          {/* Form */}
          <form onSubmit={resetPassword} className="w-full space-y-6">
            <Card className="w-full border-none shadow-none">
              <CardContent className="p-0 space-y-6">
                {/* New Password field */}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-end gap-0.5">
                    <label className="font-medium text-[#414651] text-sm text-right tracking-[0] leading-6 [direction:rtl]">
                      {glossary.resetPassword.newPassword}
                    </label>
                    <span className="text-[#286456] text-sm">*</span>
                  </div>
                  <Input
                    type="password"
                    className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs text-right [direction:rtl]"
                    placeholder={glossary.resetPassword.enterPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Confirm Password field */}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-end gap-0.5">
                    <label className="font-medium text-[#414651] text-sm text-right tracking-[0] leading-6 [direction:rtl]">
                      {glossary.resetPassword.confirmPassword}
                    </label>
                    <span className="text-[#286456] text-sm">*</span>
                  </div>
                  <Input
                    type="password"
                    className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs text-right [direction:rtl]"
                    placeholder={glossary.resetPassword.confirmPasswordPlaceholder}
                    value={confirmedPassword}
                    onChange={(e) => setConfirmedPassword(e.target.value)}
                  />
                </div>

                {/* Error message */}
                {resetError && (
                  <p className="w-full font-normal text-[#d92c20] text-sm tracking-[0] leading-5 [direction:rtl] text-right">
                    {resetError}
                  </p>
                )}

                {/* Reset button */}
                <div className="w-full pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-[#006A61] hover:bg-[#005A51] text-white rounded-lg py-2.5 font-medium text-base [direction:rtl]"
                    disabled={loading || isSubmitting || password !== confirmedPassword || !password}
                  >
                    {loading || isSubmitting ? "جاري التحديث..." : glossary.resetPassword.submit}
                  </Button>
                </div>

                {/* Back to login link */}
                <div className="w-full pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full font-medium text-[#414651] text-sm leading-5 [direction:rtl] hover:text-[#006A61] transition-colors"
                  >
                    العودة إلى تسجيل الدخول
                  </button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
