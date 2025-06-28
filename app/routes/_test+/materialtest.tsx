import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import materialDB from "~/db/material/material.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import { createId } from "@paralleldrive/cuid2";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = await getAuthenticated({ request, context });
  if (!user) {
    return json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }
  
  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const materials = await materialDB.getAllMaterials(dbUrl);
  return json({ materials });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const user = await getAuthenticated({ request, context });
  if (!user) {
    return json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }
  
  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const formData = await request.formData();
  const title = formData.get("title") as string;
  
  if (!title) {
    return json({ status: "error", message: "Title is required" });
  }
  
  // Generate a test storage key
  const key = `test-material-${Date.now()}-${createId()}`;
  
  // Create material
  try {
    const result = await materialDB.createMaterial(
      {
        title,
        storageKey: key,
        categoryId: "5",
        published: true,
      },
      dbUrl
    );
    
    return json({ status: "success", message: "Created successfully", key });
  } catch (error) {
    return json({ status: "error", message: String(error) });
  }
}

export default function MaterialTestPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const materials = data.materials;
  
  return (
    <div>
        

      <h1>Material Creation Test</h1>
      <br />
        <br /><br />
        <br /><br />
        <br /><br />
        <br />
      <Form method="post">
        <div>
          <label>
            Title: <input type="text" name="title" required />
          </label>
          <button type="submit">Create Material</button>
        </div>
      </Form>
      
      {actionData && (
        <div style={{
          margin: '10px 0',
          padding: '10px',
          backgroundColor: actionData.status === 'success' ? '#d4edda' : '#f8d7da',
        }}>
          <p>{actionData.message}</p>
          {actionData.key && <p>Key: {actionData.key}</p>}
        </div>
      )}
      
      <h2>Existing Materials ({materials.data?.length || 0})</h2>
      
      {materials.status === "success" && materials.data?.map((material: any) => (
        <div key={material.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ddd' }}>
          <h3>{material.title}</h3>
          <p>Key: {material.storageKey}</p>
        </div>
      ))}
    </div>
  );
}