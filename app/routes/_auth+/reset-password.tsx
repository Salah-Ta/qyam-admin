import { Form, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { authClient } from "../../lib/auth.client";
import { cn } from "../../lib/tw-merge";
import { getErrorMessage } from "../../lib/get-error-messege";
import glossary from "./glossary";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const navigate = useNavigate();

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmedPassword) {
      // You might want to show a toast with:
      // glossary.resetPassword.toast.passwordMismatch
      return;
    }

    await authClient.resetPassword(
      {
        newPassword: password,
      },
      {
        onRequest: () => {
          // show loading state
        },
        onSuccess: () => {
          // You might want to show a toast with:
          // glossary.resetPassword.toast.success
          navigate("/");
        },
        onError: (error) => {
          // You might want to show a toast with:
          // glossary.resetPassword.toast.error
          // console.log("msg error in reset password", error);
        },
      }
    );
  };

  return (
    <div className="h-full min-h-screen w-full flex flex-col justify-between items-center pt-[96px]">
      <h2 className="mt-24 text-primary">
        {glossary.resetPassword.title}
      </h2>
      <Form className="my-auto flex flex-col w-2/12" onSubmit={resetPassword}>
        <p className="text-xs lg:text-base md:text-sm my-1 text-primary">
          {glossary.resetPassword.newPassword}
        </p>
        <input
          className="text-xs lg:text-base md:text-sm p-1 bg-white text-black border rounded w-full"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={glossary.resetPassword.enterPassword}
        />

        <p className="text-xs lg:text-base md:text-sm my-1 text-primary mt-4">
          {glossary.resetPassword.confirmPassword}
        </p>
        <input
          className="text-xs lg:text-base md:text-sm p-1 bg-white text-black border rounded w-full"
          type="password"
          value={confirmedPassword}
          onChange={(e) => setConfirmedPassword(e.target.value)}
          placeholder={glossary.resetPassword.confirmPasswordPlaceholder}
        />

        <button
          className={cn(
            "button min-w-24 text-xs lg:text-base md:text-sm text-center bg-primary hover:opacity-90 transition-opacity text-white rounded-lg mt-6 w-full p-3 z-10",
            {
              "opacity-50 cursor-not-allowed": password !== confirmedPassword || !password,
            }
          )}
          type="submit"
          disabled={password !== confirmedPassword || !password}
        >
          {glossary.resetPassword.submit}
        </button>
      </Form>
    </div>
  );
};

export default ResetPassword;
