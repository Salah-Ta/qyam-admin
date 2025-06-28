import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import eduAdminService from "~/db/eduAdmin/eduAdmin.server";
import programService from "~/db/program/program.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import type { EduAdmin, Program, QUser } from "~/types/types";
import { useState } from "react";

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
    
    // Fetch both eduAdmins and programs
    const eduAdminsResponse = await eduAdminService.getAllEduAdmins(dbUrl);
    const programsResponse = await programService.getAllPrograms(dbUrl);
    
    return json({ user, eduAdminsResponse, programsResponse });
  } catch (error) {
    console.error("Error:", error);
    return json({ status: "error", message: "Failed to fetch data" }, { status: 500 });
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
    const description = formData.get("description") as string;
    
    if (!name || !description) {
      return json({ status: "error", message: "Name and description are required" }, { status: 400 });
    }
    
    // Create new program
    const program = {
      name,
      description,
      createdById: user.id,
    };
    
    const result = await programService.createProgram(program as Program, dbUrl);
    return json({ status: "success", message: "Program created successfully", result });
    
  } catch (error) {
    console.error("Error creating program:", error);
    return json({ status: "error", message: "Failed to create program" }, { status: 500 });
  }
}

export default function TestPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const user = data.user as QUser;
  const eduAdminsResponse = data.eduAdminsResponse;
  const programsResponse = data.programsResponse;
  
  return (
    <div>
      <h2>User Info</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      
      <h2>Create New Program</h2>
      <div style={{ marginBottom: '30px' }}>
        <Form method="post">
          <div style={{ marginBottom: '10px' }}>
            <label>Name: <input type="text" name="name" required style={{ border: '1px solid #ccc', padding: '5px' }} /></label>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label>Description: <textarea name="description" required style={{ border: '1px solid #ccc', padding: '5px', width: '300px', height: '100px' }} /></label>
          </div>
          
          <button type="submit" style={{ 
            padding: '8px 16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Create Program
          </button>
        </Form>
        
        {actionData && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px',
            backgroundColor: actionData.status === 'success' ? '#d4edda' : '#f8d7da',
            color: actionData.status === 'success' ? '#155724' : '#721c24',
            borderRadius: '4px'
          }}>
            {actionData.message}
          </div>
        )}
      </div>
      
      <h2>All Programs</h2>
      {programsResponse.status === "error" ? (
        <p>Error: {programsResponse.message}</p>
      ) : (
        <div>
          <p>Total: {programsResponse.data?.length || 0} programs</p>
          
          {programsResponse.data?.length > 0 ? (
            <div>
              {programsResponse.data.map((program: Program) => (
                <div key={program.id} style={{ 
                  marginBottom: '15px', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px' 
                }}>
                  <h3>{program.name}</h3>
                  <p>Description: {program.description}</p>
                  <p>Created by: {program.createdById}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No programs found</p>
          )}
        </div>
      )}
      
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