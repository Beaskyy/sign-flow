import pako from 'pako';

export interface MotionPayload {
  sequence: any[]; // The raw frame list
}

export interface CompressedPayload {
  compression: string;
  content: string;
}

/**
 * Decompress a GZIP-Base64 encoded string into a parsed JSON object.
 * Used for `pose_keypoints` in library video detail and `sign_descriptions` in conversation messages.
 */
export function decompressGzipBase64<T = any>(b64String: string): T | null {
  try {
    const binStr = atob(b64String);
    const uint8 = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      uint8[i] = binStr.charCodeAt(i);
    }
    const jsonStr = pako.ungzip(uint8, { to: 'string' });
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("❌ Failed to decompress GZIP-Base64 data:", err);
    return null;
  }
}

/**
 * Parses the API response, handling both compressed and legacy uncompressed data.
 * Compatible with the structure defined in API_BREAKING_CHANGE_COMPRESSION.md
 */
export function parseMotionPayload(data: any): MotionPayload | null {
  if (!data) return null;

  // 1. Check for New Compressed Format (gzip_base64) — wrapped object
  if (data.compression === 'gzip_base64' && typeof data.content === 'string') {
    const parsed = decompressGzipBase64(data.content);
    if (!parsed) return null;
    // The guide says it resolves to { "sequence": [...] }
    return parsed; 
  }

  // 2. Check if it's a raw GZIP-Base64 string (new API sends sign_descriptions as a plain string)
  if (typeof data === 'string') {
    // Try to detect base64-encoded gzip (starts with H4sI which is the gzip magic bytes in base64)
    if (data.startsWith('H4sI') || data.length > 100) {
      const parsed = decompressGzipBase64(data);
      if (parsed) {
        if (Array.isArray(parsed)) return { sequence: parsed };
        if (parsed.sequence && Array.isArray(parsed.sequence)) return parsed;
        return null;
      }
    }
    return null;
  }

  // 3. Fallback: Data is already uncompressed array or sequence wrapper
  if (Array.isArray(data)) {
    return { sequence: data };
  }
  
  if (data.sequence && Array.isArray(data.sequence)) {
    return data;
  }

  // 4. Fallback for nested objects (e.g. data.motion_sequence or data.sign_descriptions)
  if (data.motion_sequence) {
    return parseMotionPayload(data.motion_sequence);
  }
  if (data.sign_descriptions) {
    return parseMotionPayload(data.sign_descriptions);
  }

  console.warn("⚠️ Unknown motion data format:", data);
  return null;
}

