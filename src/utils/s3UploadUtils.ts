// This module is intended for SERVER-SIDE use only (Node.js / Next.js Route Handlers).
import { env } from "@/env";
import base64 from "base64-js";
import CryptoJS from "crypto-js";

export const S3_ENDPOINT = env.NEXT_PUBLIC_S3_ENDPOINT;
export const S3_REGION = env.S3_REGION || "us-east-1";
const ACCESS_KEY = env.S3_ACCESS_KEY;
const SECRET_KEY = env.S3_SECRET_KEY;

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

interface SignAwsV4Params {
  method: string;
  bucket: string;
  key: string;
  mimeType: string;
  bodyHash: string; // hex SHA-256
  tenantEmail: string;
  credentials?: AwsCredentials;
}

interface GeneratePresignParams {
  bucket: string;
  key: string;
  expiresIn?: number;
  credentials?: AwsCredentials;
}

/**
 * Decode JWT and extract tenant + email
 */
export function parseJwt(token: string): { tenant_id: string; email: string } {
  const parts = token.split(".");
  if (parts.length < 2) throw new Error("Invalid JWT: missing payload");
  const base64Payload = parts[1] || ""; // safe default
  const padded = base64Payload.padEnd(
    base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
    "=",
  );
  const decodedBytes = base64.toByteArray(padded);
  const json = new TextDecoder().decode(decodedBytes);
  const payload = JSON.parse(json);
  return { tenant_id: payload.tenant_id, email: payload.email };
}

function hmac(key: string | CryptoJS.lib.WordArray, msg: string) {
  return CryptoJS.HmacSHA256(msg, key);
}

/**
 * Create AWS Signature V4
 */
export function signAwsV4({
  method,
  bucket,
  key,
  mimeType,
  bodyHash,
  tenantEmail,
  credentials,
}: SignAwsV4Params) {
  const accessKey = credentials?.accessKeyId || ACCESS_KEY;
  const secretKey = credentials?.secretAccessKey || SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error(
      "Missing AWS credentials. Provide S3_ACCESS_KEY and S3_SECRET_KEY in server environment.",
    );
  }
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // e.g. 20250105T120000Z
  const dateStamp = amzDate.slice(0, 8); // YYYYMMDD

  const endpointHost = (() => {
    try {
      return new URL(S3_ENDPOINT).host;
    } catch {
      return "s3.percolationlabs.ai";
    }
  })();

  const canonicalHeaders =
    `content-type:${mimeType}\n` +
    `host:${endpointHost}\n` +
    `x-amz-content-sha256:${bodyHash}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-user-email:${tenantEmail}\n`;

  const signedHeaders =
    "content-type;host;x-amz-content-sha256;x-amz-date;x-user-email";

  const canonicalRequest = [
    method,
    `/${bucket}/${key}`,
    "",
    canonicalHeaders,
    signedHeaders,
    bodyHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${S3_REGION}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    CryptoJS.SHA256(canonicalRequest).toString(),
  ].join("\n");

  const kDate = hmac("AWS4" + secretKey, dateStamp);
  const kRegion = hmac(kDate, S3_REGION);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = hmac(kSigning, stringToSign).toString();

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { authorization, amzDate };
}

/**
 * Upload to S3 using AWS V4 signed PUT
 */
// Upload a File (browser). Accepts native File or Blob + filename.
// Server helper: compute SHA-256 of a Buffer (hex)
export function sha256Hex(buffer: Uint8Array | Buffer) {
  const wordArray = CryptoJS.lib.WordArray.create(buffer as any);
  return CryptoJS.SHA256(wordArray).toString();
}

// Generate an S3 object key for uploads (customize as needed)
export function generateUploadKey(fileName: string) {
  const iso = new Date().toISOString();
  const datePart = iso.split("T")[0] || "1970-01-01";
  const datePath = datePart.replace(/-/g, "/");
  return `uploads/${datePath}/${fileName}_${Date.now()}`;
}

// Create a presigned PUT URL (browser will use this to upload directly)
export function presignPutObject(
  bucket: string,
  key: string,
  expiresInSeconds = 3600,
  credentials?: AwsCredentials,
) {
  const bodyHash = "UNSIGNED-PAYLOAD";
  const accessKey = credentials?.accessKeyId || ACCESS_KEY;
  const secretKey = credentials?.secretAccessKey || SECRET_KEY;
  if (!accessKey || !secretKey) throw new Error("Missing AWS credentials");

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${S3_REGION}/s3/aws4_request`;

  const endpointHost = (() => {
    try {
      return new URL(S3_ENDPOINT).host;
    } catch {
      return "s3.percolationlabs.ai";
    }
  })();

  const signedHeaders = "host";

  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKey}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresInSeconds),
    "X-Amz-SignedHeaders": signedHeaders,
  });

  const canonicalRequest = [
    "PUT",
    `/${bucket}/${key}`,
    query.toString(),
    `host:${endpointHost}\n`,
    signedHeaders,
    bodyHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    CryptoJS.SHA256(canonicalRequest).toString(),
  ].join("\n");

  const kDate = hmac("AWS4" + secretKey, dateStamp);
  const kRegion = hmac(kDate, S3_REGION);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = hmac(kSigning, stringToSign).toString();

  const presignedUrl = `${S3_ENDPOINT}/${bucket}/${key}?${query.toString()}&X-Amz-Signature=${signature}`;
  return { url: presignedUrl, key };
}

export function generatePresignedUrl({
  bucket,
  key,
  expiresIn = 3600,
  credentials,
}: GeneratePresignParams) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const credentialScope = `${dateStamp}/${S3_REGION}/s3/aws4_request`;

  const accessKey = credentials?.accessKeyId || ACCESS_KEY;
  const secretKey = credentials?.secretAccessKey || SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error(
      "Missing AWS credentials. Generate presigned URL on the server instead of in the browser.",
    );
  }

  // 🔹 Query params for presigned URL
  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKey}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  });

  // 🔹 Canonical request
  const endpointHost = (() => {
    try {
      return new URL(S3_ENDPOINT).host;
    } catch {
      return "s3.percolationlabs.ai";
    }
  })();

  const canonicalRequest = [
    "GET",
    `/${bucket}/${key}`,
    queryParams.toString(),
    `host:${endpointHost}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    CryptoJS.SHA256(canonicalRequest).toString(),
  ].join("\n");

  // 🔹 SigV4 signing key
  function hmacLocal(key: string | CryptoJS.lib.WordArray, msg: string) {
    return CryptoJS.HmacSHA256(msg, key);
  }
  const kDate = hmacLocal("AWS4" + secretKey, dateStamp);
  const kRegion = hmacLocal(kDate, S3_REGION);
  const kService = hmacLocal(kRegion, "s3");
  const kSigning = hmacLocal(kService, "aws4_request");
  const signature = hmacLocal(kSigning, stringToSign).toString();

  // 🔹 Final presigned URL
  return `${S3_ENDPOINT}/${bucket}/${key}?${queryParams.toString()}&X-Amz-Signature=${signature}`;
}
