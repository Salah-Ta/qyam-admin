import { Form, useNavigate } from "@remix-run/react";
import React, { useState } from "react";
import { authClient } from "../../lib/auth.client";
import { getErrorMessage } from "../../lib/get-error-messege";
import glossary from "./glossary";
import { toast as showToast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const resetPassword = async () => {
    const { data, error } = await authClient.forgetPassword(
      {
        email,
        redirectTo: "/reset-password",
      },
      {
        onRequest: (ctx: any) => {
          // show loading state
        },
        onSuccess: (ctx: any) => {
          showToast.success("اعادة تعيين كلمة المرور", {
            description: "تم ارسال رابط تعيين كلمة المرور عبر بريدك الالكتروني",
          });

          navigate("/");
        },
        onError: (ctx: any) => {
          const msg = getErrorMessage(ctx);
          showToast.error("اعادة تعيين كلمة المرور", {
            description: "حدث خطأ اثناء عملية  تعيين كلمة المرور   ",
          });
          console.log("msg error in login", ctx);
        },
      }
    );
  };

  return (
    <div className="h-full min-h-screen w-full flex flex-col justify-between items-center pt-[96px]">
      <h2 className="mt-24 text-primary">{glossary.forgotPassword.title}</h2>
      <Form className="my-auto flex flex-col" onSubmit={resetPassword}>
        <p className="text-xs lg:text-base md:text-sm my-1 text-primary">{glossary.forgotPassword.yourEmail}</p>
        <input
        className="text-xs lg:text-base md:text-sm p-1 bg-white text-black border rounded w-full"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button  type="submit" className="button min-w-24 text-xs lg:text-base md:text-sm text-center bg-primary hover:opacity-90 transition-opacity text-white rounded-lg mt-6  w-full p-3 z-10">
         {glossary.forgotPassword.resetPassword}
        </button>
      </Form>
    </div>
  );
};

export default ForgotPassword;
