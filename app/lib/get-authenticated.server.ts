import { redirect } from "@remix-run/cloudflare";
import { getAuth } from "./auth.server";
import { User } from "better-auth";


export const getAuthenticated = async ({ request, context }: any)=>{

    const session = await getAuth(context).api.getSession({
        headers: request.headers, // you need to pass the headers object.
      });
      return session?.user 
        ? (session.user as User)
        : null;
}


export const requireAuth = async (request: Request, context: any, redirectTo: string = '/login') => {
  const user = await getAuthenticated({ request, context });
  if (!user) {
    throw redirect(redirectTo);
  }
  return user;
}

export const requireNoAuth = async (request: Request, context: any, redirectTo: string = '/') => {
  const user = await getAuthenticated({ request, context });
  
  if (user) {
    throw redirect(redirectTo);
  }
  return null;
}


export const requireSpecialCase = async (request: Request, context: any, condition:(user:User|null)=>boolean
  , redirectTo: string = '/') => {
  const user = await getAuthenticated({ request, context });
  const isAuthorized = condition(user)
  if (!isAuthorized) {
    throw redirect(redirectTo);
  }
  return user;
}

