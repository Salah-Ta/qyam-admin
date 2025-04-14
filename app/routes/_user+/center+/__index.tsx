import { redirect, json } from "@remix-run/react";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import { QUser } from "~/types/types";

interface LoaderContext {
  request: Request;
  context: unknown;
}

export async function loader({ request, context }: LoaderContext) {
  // Before hook - authentication check
  const user = await getAuthenticated({ request, context });
  
  if (!user) {
    return Response.json(
      { message: "Unauthorized - Please login to access this resource" },
      { status: 401 }
    );
  }
  else if (["denied", "idle"].includes((user as QUser).acceptenceState)) 
  return redirect("/404");


  // Main loader logic
  return redirect("courses");
}


