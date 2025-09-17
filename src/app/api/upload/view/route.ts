import { generatePresignedUrl, parseJwt } from "@/utils/s3UploadUtils";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/upload/view?key=<objectKey>
 * Header: Authorization: Bearer <JWT>
 * Returns: { url: string }
 */
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization Bearer token" }),
        { status: 401 },
      );
    }
    const jwt = auth.slice("Bearer ".length);
    const { tenant_id } = parseJwt(jwt);

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) {
      return new Response(
        JSON.stringify({ error: "key query param required" }),
        { status: 400 },
      );
    }

    const url = generatePresignedUrl({
      bucket: tenant_id,
      key,
      expiresIn: 3600,
    });
    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("/api/upload/view error", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500 },
    );
  }
}
