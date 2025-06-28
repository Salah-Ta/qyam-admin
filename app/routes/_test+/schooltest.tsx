import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import schoolService from "~/db/school/school.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import type { School } from "~/types/types";

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
    
    // Fetch schools
    const schoolsResponse = await schoolService.getAllSchools(dbUrl);
    
    return json({ schoolsResponse });
  } catch (error) {
    console.error("Error:", error);
    return json({ 
      schoolsResponse: { status: "error", message: "Failed to fetch schools" }
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
    const address = formData.get("address") as string;
    
    if (!name || !address) {
      return json({ status: "error", message: "Name and address are required" }, { status: 400 });
    }
    
    // Create new school
    const result = await schoolService.createSchool(name, address, dbUrl);
    return json({ status: "success", message: "School created successfully", result });
    
  } catch (error) {
    console.error("Error creating school:", error);
    return json({ status: "error", message: "Failed to create school" }, { status: 500 });
  }
}

export default function SchoolTestPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const schoolsResponse = data?.schoolsResponse || { status: "error", message: "No data available" };
  
  return (
    <div>
      <h2>Create New School</h2>
      <div style={{ marginBottom: '20px' }}>
        <Form method="post">
          <div style={{ marginBottom: '10px' }}>
            <label>Name: <input type="text" name="name" required /></label>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label>Address: <input type="text" name="address" required /></label>
          </div>
          
          <button type="submit">Create School</button>
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
      
      <h2>Schools</h2>
      {!schoolsResponse || schoolsResponse.status === "error" ? (
        <p>Error: {schoolsResponse?.message || "Failed to load schools"}</p>
      ) : (
        <div>
          <p>Total: {schoolsResponse.data?.length || 0}</p>
          
          {schoolsResponse.data?.map((school: School) => (
            <div key={school.id} style={{ marginBottom: '10px', padding: '5px', border: '1px solid #ddd' }}>
              <p><strong>{school.name}</strong></p>
              <p>Address: {school.address || "N/A"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}