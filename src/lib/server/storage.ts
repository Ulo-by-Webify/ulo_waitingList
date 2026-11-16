import "server-only";
import { randomUUID } from "node:crypto";
import type { Readable } from "node:stream";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Railway Buckets are S3-compatible and private, so files are read via presigned URLs.
const PRESIGN_TTL_SECONDS = 60 * 60;
const MEDIA_PREFIX = "media/";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
/** Videos stream straight to the bucket (see /api/admin/media/video), so they can be much larger. */
export const MAX_VIDEO_UPLOAD_BYTES = 250 * 1024 * 1024; // 250 MB

export type MediaObject = {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  /** Presigned, expires after an hour. */
  url: string;
  /** Stable path served by /api/files, safe to put in published content. */
  publicUrl: string;
};

type BucketConfig = { client: S3Client; bucket: string };
const globalForS3 = globalThis as unknown as { bucketConfig?: BucketConfig };

export function isStorageConfigured(): boolean {
  return Boolean(process.env.BUCKET && process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY && process.env.ENDPOINT);
}

function getBucket(): BucketConfig {
  if (globalForS3.bucketConfig) return globalForS3.bucketConfig;
  if (!isStorageConfigured()) {
    throw new Error("Railway bucket is not configured (BUCKET, ACCESS_KEY_ID, SECRET_ACCESS_KEY, ENDPOINT)");
  }
  const client = new S3Client({
    endpoint: process.env.ENDPOINT,
    region: process.env.REGION || "auto",
    forcePathStyle: process.env.BUCKET_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID as string,
      secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
    },
  });
  globalForS3.bucketConfig = { client, bucket: process.env.BUCKET as string };
  return globalForS3.bucketConfig;
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "")
    .slice(0, 100);
  return cleaned || "file";
}

async function presign(key: string): Promise<string> {
  const { client, bucket } = getBucket();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: PRESIGN_TTL_SECONDS,
  });
}

export type UploadInput = { bytes: Buffer; contentType: string; extension: string; originalName: string };

function newMediaKey(originalName: string, extension: string): string {
  const baseName = sanitizeFileName(originalName.replace(/\.[^.]*$/, "")).slice(0, 60) || "file";
  return `${MEDIA_PREFIX}${randomUUID()}-${baseName}.${extension}`;
}

async function describeUpload(key: string, size: number): Promise<MediaObject> {
  return {
    key,
    name: key.slice(MEDIA_PREFIX.length),
    size,
    lastModified: new Date().toISOString(),
    url: await presign(key),
    publicUrl: publicMediaUrl(key),
  };
}

/** Stores a file whose type has already been verified from its contents (see file-type.ts). */
export async function uploadMedia(input: UploadInput): Promise<MediaObject> {
  const { client, bucket } = getBucket();
  const key = newMediaKey(input.originalName, input.extension);
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: input.bytes, ContentType: input.contentType }));
  return describeUpload(key, input.bytes.length);
}

export type StreamUploadInput = {
  body: Readable;
  /** Exact size in bytes; the bucket rejects the upload if the stream doesn't match. */
  contentLength: number;
  contentType: string;
  extension: string;
  originalName: string;
};

/** Streams a large file (a video) to the bucket without holding it in memory. Type must already be verified. */
export async function uploadMediaStream(input: StreamUploadInput): Promise<MediaObject> {
  const { client, bucket } = getBucket();
  const key = newMediaKey(input.originalName, input.extension);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: input.body,
      ContentLength: input.contentLength,
      ContentType: input.contentType,
    }),
  );
  return describeUpload(key, input.contentLength);
}

export async function listMedia(): Promise<MediaObject[]> {
  const { client, bucket } = getBucket();
  const result = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: MEDIA_PREFIX, MaxKeys: 500 }));
  const objects = (result.Contents ?? [])
    .filter((o) => o.Key && o.Key !== MEDIA_PREFIX)
    .sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0));

  return Promise.all(
    objects.map(async (o) => ({
      key: o.Key as string,
      name: (o.Key as string).slice(MEDIA_PREFIX.length),
      size: o.Size ?? 0,
      lastModified: (o.LastModified ?? new Date()).toISOString(),
      url: await presign(o.Key as string),
      publicUrl: publicMediaUrl(o.Key as string),
    })),
  );
}

/** Public, stable URL for a bucket file (served by /api/files). Use for content shown on the site. */
export function publicMediaUrl(key: string): string {
  return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function isValidMediaKey(key: string): boolean {
  return key.startsWith(MEDIA_PREFIX) && !key.includes("..") && key.length <= 512;
}

/** Reads a file, or part of it when `range` is an HTTP Range header (e.g. "bytes=0-1023"). */
export async function getMediaObject(key: string, range?: string) {
  if (!isValidMediaKey(key)) throw new Error("Invalid media key");
  const { client, bucket } = getBucket();
  return client.send(new GetObjectCommand({ Bucket: bucket, Key: key, ...(range ? { Range: range } : {}) }));
}

export async function deleteMedia(key: string): Promise<void> {
  if (!isValidMediaKey(key)) throw new Error("Invalid media key");
  const { client, bucket } = getBucket();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
