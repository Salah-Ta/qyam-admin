
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare"
import { getAuth } from "../../lib/auth.server";
 
export async function loader({ request,context }: LoaderFunctionArgs) {
    const auth = getAuth(context)    
    return auth.handler(request)
}

 
export async function action({ request ,context}: ActionFunctionArgs) {
    // console.log("The request in the action auth api:  ", request);
    const auth = getAuth(context)
    console.log("auth in api.auth action:   ",auth, request,context);


    return auth.handler(request)
}