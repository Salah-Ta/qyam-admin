import { redirect } from "@remix-run/cloudflare";
import { getAuth } from "../../lib/auth.server";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createToastHeaders } from "~/lib/toast.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  return getAuth(context)
    .api.signOut({ headers: request.headers })
    .then(() => {
      return redirect("/");
    })
    .catch(async () => {
      return Response.json(
        { success: false },
        {
          headers: await createToastHeaders({
            description: "",
            title: "حدث خطأ أثناء تسجيل الخروج",
            type: "error",
          }),
        }
      );
    });
}
