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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    // Basic validation
    if (!email) {
      setResetError("البريد الإلكتروني مطلوب");
      return;
    }

    try {
      setLoading(true);

      // Check user approval status before sending reset password
      const checkResponse = await fetch('/api/check-user-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (!checkData.canReset) {
          setLoading(false);
          setErrorModalMessage(checkData.message);
          setShowErrorModal(true);
          return;
        }
      }

      const { data, error } = await authClient.forgetPassword(
        {
          email,
          redirectTo: "/reset-password",
        },
        {
          onRequest: (ctx: any) => {
            console.log("Password reset request started");
          },
          onSuccess: (ctx: any) => {
            setLoading(false);
            showToast.success("اعادة تعيين كلمة المرور", {
              description: "تم ارسال رابط تعيين كلمة المرور عبر بريدك الالكتروني",
            });

            navigate("/");
          },
          onError: (ctx: any) => {
            setLoading(false);
            const msg = getErrorMessage(ctx);
            showToast.error("اعادة تعيين كلمة المرور", {
              description: "حدث خطأ اثناء عملية  تعيين كلمة المرور   ",
            });
            setResetError(msg);
            console.log("msg error in forgot password", ctx);
          },
        }
      );
    } catch (error) {
      setLoading(false);
      setResetError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      showToast.error("فشل في إعادة تعيين كلمة المرور", {
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
                {glossary.forgotPassword.title}
              </h1>
              <p className="w-full font-medium text-[#535861] text-base text-center tracking-[0] leading-6 [direction:rtl]">
                أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
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
                      {glossary.forgotPassword.yourEmail}
                    </label>
                    <span className="text-[#286456] text-sm">*</span>
                  </div>
                  <Input
                    type="email"
                    className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs text-right [direction:rtl]"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Error message */}
                {resetError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center [direction:rtl]">
                    {resetError}
                  </div>
                )}

                {/* Reset button */}
                <div className="w-full pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-[#006A61] hover:bg-[#005A51] text-white rounded-lg py-2.5 font-medium text-base [direction:rtl]"
                    disabled={loading || isSubmitting}
                  >
                    {loading || isSubmitting ? "جاري الإرسال..." : glossary.forgotPassword.resetPassword}
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

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 [direction:rtl]">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                تنبيه
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {errorModalMessage}
              </p>
              <Button
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-[#006A61] hover:bg-[#005A51] text-white rounded-lg py-2.5 font-medium text-base"
              >
                موافق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
