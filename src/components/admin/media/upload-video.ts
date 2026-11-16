"use client";

/** Matches MAX_VIDEO_UPLOAD_BYTES on the server; checked here too so a big file fails before uploading. */
export const MAX_VIDEO_MB = 250;
export const VIDEO_ACCEPT = "video/mp4,video/webm";

export type UploadedMedia = { key: string; name: string; url: string; publicUrl: string; size: number; lastModified: string };

/**
 * Uploads a video straight to /api/admin/media/video (raw body, streamed to the bucket).
 * Uses XMLHttpRequest because fetch can't report upload progress.
 */
export function uploadVideo(file: File, onProgress?: (percent: number) => void): Promise<UploadedMedia> {
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    return Promise.reject(new Error(`Video is larger than ${MAX_VIDEO_MB} MB. Compress it and try again.`));
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media/video");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      const body = (xhr.response ?? {}) as { data?: UploadedMedia; error?: string };
      if (xhr.status >= 200 && xhr.status < 300 && body.data) resolve(body.data);
      else reject(new Error(body.error ?? "Video upload failed"));
    };
    xhr.onerror = () => reject(new Error("Network error during upload. Check your connection and try again."));
    xhr.send(file);
  });
}
