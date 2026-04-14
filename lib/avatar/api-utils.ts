import pako from 'pako';

export interface MotionPayload {
  sequence: any[]; // The raw frame list
}

export interface CompressedPayload {
  compression: string;
  content: string;
}

/**
 * Helper to decompress GZIP-Base64 strings
 */
export function decompressMotionData(b64: string): any {
  try {
    const binStr = atob(b64);
    const uint8 = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      uint8[i] = binStr.charCodeAt(i);
    }
    const jsonStr = pako.ungzip(uint8, { to: 'string' });
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("❌ Failed to decompress motion data:", err);
    return null;
  }
}

/**
 * Parses the API response, handling both compressed and legacy uncompressed data.
 * Compatible with the structure defined in Backend Update guide.
 */
export function parseMotionPayload(data: any): MotionPayload | null {
  if (!data) return null;

  // 1. Direct string case (New backend standard for sign_descriptions, pose_keypoints)
  if (typeof data === 'string' && data.startsWith('H4s')) {
    const decompressed = decompressMotionData(data);
    if (!decompressed) return null;
    return Array.isArray(decompressed) ? { sequence: decompressed } : decompressed;
  }

  // 2. Check for wrapped compressed format (compression/content)
  if (data.compression === 'gzip_base64' && typeof data.content === 'string') {
    const decompressed = decompressMotionData(data.content);
    if (!decompressed) return null;
    return Array.isArray(decompressed) ? { sequence: decompressed } : decompressed;
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
