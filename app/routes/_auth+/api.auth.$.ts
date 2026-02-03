
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare"
import { getAuth } from "../../lib/auth.server";
 
export async function loader({ request,context }: LoaderFunctionArgs) {
    const auth = getAuth(context)    
    return auth.handler(request)
}

 
export async function action({ request ,context}: ActionFunctionArgs) {
    const auth = getAuth(context)


    return auth.handler(request)
}