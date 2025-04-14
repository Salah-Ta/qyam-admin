
import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";

export async function loader({ request, context }: LoaderFunctionArgs) {
    return redirect("users")
  }
  