import pako from 'pako';

export interface MotionPayload {
  sequence: any[]; // The raw frame list
}

export interface CompressedPayload {
  compression: string;
  content: string;
}

/**
 * Parses the API response, handling both compressed and legacy uncompressed data.
 * Compatible with the structure defined in API_BREAKING_CHANGE_COMPRESSION.md
 */
export function parseMotionPayload(data: any): MotionPayload | null {
  if (!data) return null;

  // 1. Check for New Compressed Format (gzip_base64)
  if (data.compression === 'gzip_base64' && typeof data.content === 'string') {
    try {
      const b64 = data.content;
      const binStr = atob(b64);
      const uint8 = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) {
        uint8[i] = binStr.charCodeAt(i);
      }
      const jsonStr = pako.ungzip(uint8, { to: 'string' });
      const parsed = JSON.parse(jsonStr);
      
      // The guide says it resolves to { "sequence": [...] }
      return parsed; 
    } catch (err) {
      console.error("❌ Failed to decompress motion data:", err);
      return null;
    }
  }

  // 2. Fallback: Data is already uncompressed array or sequence wrapper
  if (Array.isArray(data)) {
    return { sequence: data };
  }
  
  if (data.sequence && Array.isArray(data.sequence)) {
    return data;
  }

  // 3. Fallback for nested objects (e.g. data.motion_sequence)
  if (data.motion_sequence) {
    return parseMotionPayload(data.motion_sequence);
  }

  console.warn("⚠️ Unknown motion data format:", data);
  return null;
}
