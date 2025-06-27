import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import eduAdminService from "~/db/eduAdmin/eduAdmin.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import type { EduAdmin, QUser } from "~/types/types";

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const user = await getAuthenticated({ request, context });
    
    if (!user) {
      return json({ status: "error", message: "Authentication required" }, { status: 401 });
    }
    
    const dbUrl = context.cloudflare.env.DATABASE_URL;
    
    if (!dbUrl) {
      return json({ status: "error", message: "Database URL is not configured" }, { status: 500 });
    }
    
    const eduAdminsResponse = await eduAdminService.getAllEduAdmins(dbUrl);
    
    return json({ user, eduAdminsResponse });
  } catch (error) {
    console.error("Error:", error);
    return json({ status: "error", message: "Failed to fetch data" }, { status: 500 });
  }
}

export default function TestPage() {
  const data = useLoaderData<typeof loader>();
  const user = data.user as QUser;
  const eduAdminsResponse = data.eduAdminsResponse;
  
  return (
    <div>
      <h2>User Info</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      
      <h2>Educational Administrations</h2>
      {eduAdminsResponse.status === "error" ? (
        <p>Error: {eduAdminsResponse.message}</p>
      ) : (
        <div>
          <p>Total: {eduAdminsResponse.data?.length || 0}</p>
          
          {eduAdminsResponse.data?.map((admin: EduAdmin) => (
            <div key={admin.id} style={{ marginBottom: '20px' }}>
              <h3>{admin.name}</h3>
              <p>Region: {admin.region?.name || "N/A"}</p>
              
              <h4>Schools ({admin.schools?.length || 0})</h4>
              {admin.schools?.length > 0 ? (
                <ul>
                  {admin.schools.map(school => (
                    <li key={school.id}>{school.name}</li>
                  ))}
                </ul>
              ) : (
                <p>No schools</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}