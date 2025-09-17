import {
  generateUploadKey,
  parseJwt,
  presignPutObject,
} from "@/utils/s3UploadUtils";
import { NextRequest } from "next/server";

export const runtime = "nodejs"; // ensure server runtime

/**
 * POST /api/upload/presign
 * Body: { fileName: string; }
 * Header: Authorization: Bearer <JWT>
 * Returns: { url: string; key: string }
 */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization Bearer token" }),
        { status: 401 },
      );
    }
    const jwt = auth.slice("Bearer ".length);
    const { tenant_id, email } = parseJwt(jwt);

    const body = await req.json().catch(() => ({}));
    const { fileName, mimeType } = body as {
      fileName?: string;
      mimeType?: string;
    };
    if (!fileName || !mimeType) {
      return new Response(
        JSON.stringify({ error: "fileName and mimeType required" }),
        { status: 400 },
      );
    }

    const key = generateUploadKey(fileName);

    const { url } = presignPutObject(tenant_id, key, 3600);

    return new Response(JSON.stringify({ url, key }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("/api/upload/presign error", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500 },
    );
  }
}
