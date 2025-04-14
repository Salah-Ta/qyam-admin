import {
  Form,
  Link,
  useNavigate,
  useActionData,
  useNavigation,
  NavLink,
} from "@remix-run/react";
import { useState } from "react";
import { authClient } from "../../lib/auth.client";
import { getErrorMessage } from "../../lib/get-error-messege";
import Logo from "~/assets/images/logo.svg";
import LoginImg from "~/assets/images/login.png";
import GradientEllipse from "~/components/ui/gradient-ellipse";
import LoadingOverlay from "~/components/loading-overlay";
import { toast as showToast } from "sonner";
import glossary from "./glossary";

import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { requireSpecialCase } from "~/lib/get-authenticated.server";
import { Icon } from "~/components/icon";

export async function loader({ request, context }: LoaderFunctionArgs) {
  //todo: uncomment when disabling login
  // return redirect("/");
  const user = await requireSpecialCase(
    request,
    context,
    (user) => user === null
  );
  return { user };
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const isSubmitting = navigation.state === "submitting";

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
            // console.log("error in sign in:  ", ctx);
            
            setLoading(false);

            // console.log(ctx);
            if (
              ctx.error.code ===
              "EMAIL_IS_NOT_VERIFIED_CHECK_YOUR_EMAIL_FOR_A_VERIFICATION_LINK"
            ) {
              showToast.error(glossary.login.errors.unverified);
            } 
            
            else if(ctx.error.code === "FAILED_TO_CREATE_SESSION"){
              showToast.error(glossary.signup.toasts.signupError.title, {
                description: glossary.signup.toasts.signupError.sessionFailure,
              });

            }
            else {
              showToast.error(glossary.login.errors.invalid);
            }
            

            const errorMessage = getErrorMessage(ctx);
            // Handle error appropriately - you might want to set this in state
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
    <div className="lg:flex lg:flex-row  justify-between items-center w-full h-screen overflow-hidden ">
      { (loading || isSubmitting )&& <LoadingOverlay />}
      <div className="blur-[180px] inset-0 absolute">
        <div className="relative h-full w-full overflow-hidden">
          <GradientEllipse
            bgColor={"bg-[rgb(139,197,63)]/50"}
            className={" -top-24 lg:right-16 right-0"}
          />

          <GradientEllipse
            bgColor={"bg-[#B8ECFF]"}
            className={"lg:left-96 -left-16 top-44"}
          />
          <GradientEllipse
            bgColor={"bg-[rgb(3,102,157)]/50"}
            className={"lg:top-96 lg:right-0"}
          />
        </div>
      </div>
      <div className="h-full w-full flex flex-col  justify-center items-center z-10 overflow-y-hidden">
      <div className="relative ">

      <img
          className="lg:my-16 my-8 z-10 lg:w-[186px] lg:h-[155px]  w-[144px] h-[120px] brd"
          src={Logo}
          alt=""
        />
      <NavLink 
      to={"/"}
      className="absolute rounded-lg px-1 border-2  hover:opacity-80 transition-opacity  border-[#4D5761] top-12 -left-[120%] ">
          <Icon name="back-arrow" size="sm"/>
        </NavLink>
      </div>
  
        <h2 className="my-5 z-10">{glossary.login.title}</h2>

        <Form
          onSubmit={handleSubmit}
          className="my-5 flex flex-col gap-2 w-full items-center justify-center z-10"
        >
          <div className="md:w-1/3  w-3/5">
            <p className="text-xs lg:text-base md:text-sm my-1 text-primary z-10">
              {glossary.login.email}
            </p>
            <input
              className="text-xs lg:text-base md:text-sm p-1 bg-white text-black border rounded w-full z-10"
              type="email"
              value={email}
              placeholder="example@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
            />
            {actionData?.errors?.email && (
              <p className="text-red-500 text-xs mt-1">
                {actionData.errors.email}
              </p>
            )}
          </div>
          <div className="md:w-1/3 w-3/5">
            <p className="text-xs lg:text-base md:text-sm my-1 text-primary z-10">
              {glossary.login.password}
            </p>
            <input
              className="text-xs lg:text-base md:text-sm p-1 bg-white text-black border rounded w-full z-10"
              type="password"
              value={password}
              placeholder="1127651158"
              onChange={(e) => setPassword(e.target.value)}
            />
            {actionData?.errors?.password && (
              <p className="text-red-500 text-xs mt-1">
                {actionData.errors.password}
              </p>
            )}
          </div>
          <div className="flex flex-col md:w-1/3 w-3/5 z-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="button text-xs lg:text-lg md:text-sm text-center bg-primary hover:opacity-90 transition-opacity text-white rounded-lg mt-6  w-full p-3 z-10"
            >
              {isSubmitting ? "جاري تسجيل الدخول..." : glossary.login.login}
            </button>

            <Link
              className="text-black text-xs lg:text-lg md:text-sm underline my-1 z-10"
              to={"/forgot-password"}
            >
              {glossary.login.forgot_password}
            </Link>
            {actionData?.errors?.generic && (
              <p className="text-red-500 text-xs mt-1">
                {actionData.errors.generic}
              </p>
            )}
            {loginError && (
              <p className="text-red-500 text-sm text-center mt-2">
                {loginError}
              </p>
            )}
          </div>
        </Form>
      </div>

      <div className="hidden lg:flex justify-center items-end h-full bg-primary w-2/3 z-10">
        <div className=" mx-2">
          <img src={LoginImg} alt="" />
        </div>
      </div>
    </div>
  );
}
