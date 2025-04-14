import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const key = url.pathname.split("/")[2];

    if (!key) {
      return Response.json({ error: "No file key provided" }, { status: 400 });
    }

    const object :R2ObjectBody| null= await (context.cloudflare as any).env.QYAM_BUCKET.get(key);

    if (!object) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }


    // Get original filename or use the key
    const filename = key.split("-").slice(1).join("-") || key;
    const content = await object.blob()

    return new Response(content, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
        "Content-Disposition": `attachment`,
        // Prevent caching of sensitive files
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return Response.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}