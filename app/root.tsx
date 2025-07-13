import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { User } from "better-auth/types";

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import  QrCode from "qrcode"

import "./tailwind.css";
import { getAuth } from "./lib/auth.server";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { Toaster } from "sonner";
import { getToast } from "./lib/toast.server";
import { useToast } from "./components/toaster";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
  },

  {
    rel:"stylesheet",
    href:"https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
  }




];

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const [sessionResponse, toastResponse] = await Promise.all([
      getAuth(context).api.getSession({
        headers: request.headers,
      }),
      getToast(request),
    ]);

    const user = sessionResponse?.user 
      ? (sessionResponse.user as User) 
      : null;

    return Response.json(
      { 
        toast: toastResponse.toast, 
        user,
        phoneNumber:context.cloudflare.env ,
      }, 
      { 
        headers: toastResponse.headers || undefined 
      }
    );
  } catch (error) {
    return Response.json(
      { 
        toast: null, 
        user: null 
      }, 
      { 
        headers: undefined 
      }
    );
  }
}
export function Layout({ children }: { children: React.ReactNode }) {
 

  return (
    <html  lang="ar" >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>قيم</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { direction: "rtl", fontFamily: "PingARLT" },
            duration: 5000,
            classNames: {
              success:
                "border bg-green-100/90 border-green-500/20 text-black/75 toast-icon-success",
              error:
                "border bg-red-100/90 border-red-500/20 text-black/75 toast-icon-error",
              info: "border bg-blue-100/90 border-blue-500/20 text-black/75 toast-icon-info",
              warning:
                "border bg-yellow-100/90 border-yellow-500/20 text-black/75 toast-icon-warning",
            },
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  const { toast, phoneNumber } = useLoaderData<any>();
  
  useToast(toast);
  // console.log("qrcode:::",generatedQRCode);


 const noNavbarRoutes = ["/login", "/join", "/register", "/forgot-password", "/reset-password"];

  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar/>}
      <Outlet />
      {showNavbar && <Footer phoneNumber={phoneNumber} text={""} />}
    </>
  );
}
