import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
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
    
    // Fetch eduAdmins
    const eduAdminsResponse = await eduAdminService.getAllEduAdmins(dbUrl);
    
    return json({ user, eduAdminsResponse });
  } catch (error) {
    console.error("Error:", error);
    return json({ 
      user: null,
      eduAdminsResponse: { status: "error", message: "Failed to fetch data" }
    }, { status: 500 });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const user = await getAuthenticated({ request, context });
    
    if (!user) {
      return json({ status: "error", message: "Authentication required" }, { status: 401 });
    }
    
    const dbUrl = context.cloudflare.env.DATABASE_URL;
    if (!dbUrl) {
      return json({ status: "error", message: "Database URL is not configured" }, { status: 500 });
    }
    
    // Get form data
    const formData = await request.formData();
    const name = formData.get("name") as string;
    
    if (!name) {
      return json({ status: "error", message: "Name is required" }, { status: 400 });
    }
    
    // Create new EduAdmin
    const result = await eduAdminService.createEduAdmin(name, dbUrl);
    return json({ status: "success", message: "Educational Administration created successfully", result });
    
  } catch (error) {
    console.error("Error creating EduAdmin:", error);
    return json({ status: "error", message: "Failed to create Educational Administration" }, { status: 500 });
  }
}

export default function TestPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const eduAdminsResponse = data?.eduAdminsResponse || { status: "error", message: "No data available" };
  
  return (
    <div>
      <h2>Create New Educational Administration</h2>
      <div style={{ marginBottom: '20px' }}>
        <Form method="post">
          <div>
            <label>Name: <input type="text" name="name" required /></label>
          </div>
          
          <button type="submit" style={{ marginTop: '10px' }}>
            Create Educational Administration
          </button>
        </Form>
        
        {actionData && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px',
            backgroundColor: actionData.status === 'success' ? '#d4edda' : '#f8d7da',
          }}>
            {actionData.message}
          </div>
        )}
      </div>
      
      <h2>Educational Administrations</h2>
      {!eduAdminsResponse || eduAdminsResponse.status === "error" ? (
        <p>Error: {eduAdminsResponse?.message || "Failed to load data"}</p>
      ) : (
        <div>
          <p>Total: {eduAdminsResponse.data?.length || 0}</p>
          
          {eduAdminsResponse.data?.map((admin: EduAdmin) => (
            <div key={admin.id} style={{ marginBottom: '10px', padding: '5px', border: '1px solid #ddd' }}>
              <p><strong>{admin.name}</strong></p>
              {admin.region && <p>Region: {admin.region.name}</p>}
              <p>Schools: {admin.schools?.length || 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}