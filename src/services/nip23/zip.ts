/**
 * Zero-dependency ZIP Archive Reader for Web, Node.js, and Cloudflare Workers.
 * Uses standard DataView, Uint8Array, and DecompressionStream('deflate-raw').
 */

export interface ZipEntry {
  path: string;
  name: string;
  isDirectory: boolean;
  uncompressedSize: number;
  compressedSize: number;
  data: Uint8Array;
  text(): string;
}

export interface UnzipOptions {
  /** Maximum number of files to extract (prevents zip bombs). Default: 500 */
  maxFiles?: number;
  /** Maximum total uncompressed bytes (prevents memory exhaustion). Default: 100MB */
  maxTotalBytes?: number;
}

const EOCD_SIGNATURE = 0x06054b50;
const CD_HEADER_SIGNATURE = 0x02014b50;
const LOCAL_HEADER_SIGNATURE = 0x04034b50;

/**
 * Extracts entries from a ZIP archive binary buffer safely in-memory.
 */
export async function unzipBuffer(
  buffer: ArrayBuffer | Uint8Array,
  options: UnzipOptions = {}
): Promise<ZipEntry[]> {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const maxFiles = options.maxFiles ?? 500;
  const maxTotalBytes = options.maxTotalBytes ?? 100 * 1024 * 1024; // 100MB

  // 1. Locate End of Central Directory (EOCD) record by scanning backwards from end of file
  let eocdOffset = -1;
  const minEocdSize = 22;
  const maxCommentSize = 65535;
  const scanLimit = Math.max(0, bytes.length - minEocdSize - maxCommentSize);

  for (let i = bytes.length - minEocdSize; i >= scanLimit; i--) {
    if (view.getUint32(i, true) === EOCD_SIGNATURE) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Invalid ZIP file: End of Central Directory record not found.');
  }

  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const cdOffset = view.getUint32(eocdOffset + 16, true);

  if (totalEntries > maxFiles) {
    throw new Error(`ZIP archive contains too many entries (${totalEntries} > ${maxFiles}).`);
  }

  const entries: ZipEntry[] = [];
  let currentCdOffset = cdOffset;
  let totalExtractedBytes = 0;

  for (let i = 0; i < totalEntries; i++) {
    if (currentCdOffset + 46 > bytes.length) break;
    const cdSig = view.getUint32(currentCdOffset, true);
    if (cdSig !== CD_HEADER_SIGNATURE) break;

    const compressionMethod = view.getUint16(currentCdOffset + 10, true);
    const compressedSize = view.getUint32(currentCdOffset + 20, true);
    const uncompressedSize = view.getUint32(currentCdOffset + 24, true);
    const fileNameLength = view.getUint16(currentCdOffset + 28, true);
    const extraFieldLength = view.getUint16(currentCdOffset + 30, true);
    const fileCommentLength = view.getUint16(currentCdOffset + 32, true);
    const localHeaderOffset = view.getUint32(currentCdOffset + 42, true);

    const fileNameBytes = bytes.subarray(currentCdOffset + 46, currentCdOffset + 46 + fileNameLength);
    const rawPath = new TextDecoder('utf-8').decode(fileNameBytes);
    const cleanPath = rawPath.replace(/\\/g, '/');
    const isDirectory = cleanPath.endsWith('/');

    // Move to next Central Directory entry
    currentCdOffset += 46 + fileNameLength + extraFieldLength + fileCommentLength;

    if (isDirectory) {
      continue;
    }

    if (totalExtractedBytes + uncompressedSize > maxTotalBytes) {
      throw new Error(`Extracted ZIP size exceeds safe limit of ${maxTotalBytes} bytes.`);
    }

    // Read Local File Header
    if (localHeaderOffset + 30 > bytes.length) {
      throw new Error(`Corrupt ZIP archive: Local header out of bounds for ${cleanPath}`);
    }

    const localSig = view.getUint32(localHeaderOffset, true);
    if (localSig !== LOCAL_HEADER_SIGNATURE) {
      throw new Error(`Corrupt ZIP archive: Invalid local header signature for ${cleanPath}`);
    }

    const localNameLen = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
    const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;

    const compressedData = bytes.subarray(dataOffset, dataOffset + compressedSize);
    let decompressedData: Uint8Array;

    if (compressionMethod === 0) {
      // Stored (no compression)
      decompressedData = compressedData;
    } else if (compressionMethod === 8) {
      // Deflate
      decompressedData = await inflateRaw(compressedData);
    } else {
      throw new Error(`Unsupported ZIP compression method: ${compressionMethod} in ${cleanPath}`);
    }

    totalExtractedBytes += decompressedData.byteLength;

    const nameParts = cleanPath.split('/');
    const name = nameParts[nameParts.length - 1] || cleanPath;

    entries.push({
      path: cleanPath,
      name,
      isDirectory: false,
      uncompressedSize,
      compressedSize,
      data: decompressedData,
      text() {
        return new TextDecoder('utf-8').decode(this.data);
      },
    });
  }

  return entries;
}

/**
 * Decompresses raw DEFLATE bytes using DecompressionStream.
 */
async function inflateRaw(compressedData: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream !== 'undefined') {
    const copy = new Uint8Array(compressedData);
    const stream = new Response(copy.buffer as ArrayBuffer).body?.pipeThrough(
      new DecompressionStream('deflate-raw')
    );
    if (stream) {
      const buffer = await new Response(stream).arrayBuffer();
      return new Uint8Array(buffer);
    }
  }

  // Node.js fallback if DecompressionStream is not available (e.g. older node contexts)
  try {
    const zlib = await import('node:zlib');
    return new Promise<Uint8Array>((resolve, reject) => {
      zlib.inflateRaw(compressedData, (err, result) => {
        if (err) reject(err);
        else resolve(new Uint8Array(result.buffer, result.byteOffset, result.byteLength));
      });
    });
  } catch {
    throw new Error('DEFLATE decompression is not supported in this runtime environment.');
  }
}
