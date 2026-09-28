/**
 * Dedicated Background Web Worker for HEIC/HEIF to JPEG conversion.
 * Runs off the main UI thread to eliminate browser locking and keep the UI at 60fps.
 */

import heic2any from 'heic2any';

interface WorkerRequest {
  id: string;
  blob: Blob;
  quality?: number;
}

interface WorkerSuccessResponse {
  id: string;
  success: true;
  buffer: ArrayBuffer;
  mimeType: string;
}

interface WorkerErrorResponse {
  id: string;
  success: false;
  error: string;
}

const workerScope = self as unknown as {
  onmessage: ((e: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: WorkerSuccessResponse | WorkerErrorResponse, transfer?: Transferable[]) => void;
};

workerScope.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, blob, quality = 0.9 } = e.data;

  try {
    const conversionResult = await (heic2any as unknown as (opts: {
      blob: Blob;
      toType?: string;
      quality?: number;
    }) => Promise<Blob | Blob[]>)({
      blob,
      toType: 'image/jpeg',
      quality,
    });

    const jpegBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
    const arrayBuffer = await jpegBlob.arrayBuffer();

    // Transfer the ArrayBuffer with zero-copy memory transfer
    const response: WorkerSuccessResponse = {
      id,
      success: true,
      buffer: arrayBuffer,
      mimeType: 'image/jpeg',
    };

    workerScope.postMessage(response, [arrayBuffer]);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const response: WorkerErrorResponse = {
      id,
      success: false,
      error: errorMsg,
    };
    workerScope.postMessage(response);
  }
};
