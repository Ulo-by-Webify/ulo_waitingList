import "server-only";

/**
 * Helpers for streaming an upload to the bucket while still checking it: peek at the first bytes
 * (to verify the file type) and cap the total size, without buffering the whole file.
 */

/** Reads at least `bytes` bytes from the start of a stream. `stream` replays everything, head included. */
export async function peekHead(
  source: ReadableStream<Uint8Array>,
  bytes: number,
): Promise<{ head: Uint8Array; stream: ReadableStream<Uint8Array> }> {
  const reader = source.getReader();
  const buffered: Uint8Array[] = [];
  let total = 0;
  let isDone = false;
  while (total < bytes) {
    const { value, done } = await reader.read();
    if (done) {
      isDone = true;
      break;
    }
    buffered.push(value);
    total += value.byteLength;
  }

  const head = new Uint8Array(total);
  let offset = 0;
  for (const chunk of buffered) {
    head.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      buffered.forEach((chunk) => controller.enqueue(chunk));
      if (isDone) controller.close();
    },
    async pull(controller) {
      const { value, done } = await reader.read();
      if (done) controller.close();
      else controller.enqueue(value);
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
  return { head: head.subarray(0, Math.min(total, bytes)), stream };
}

/** Passes bytes through, failing the stream once more than `maxBytes` have gone by. */
export function limitBytes(source: ReadableStream<Uint8Array>, maxBytes: number): ReadableStream<Uint8Array> {
  let seen = 0;
  return source.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        seen += chunk.byteLength;
        if (seen > maxBytes) controller.error(new Error("Upload is larger than its declared size"));
        else controller.enqueue(chunk);
      },
    }),
  );
}
