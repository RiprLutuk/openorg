export type SupportedImage = {
  extension: "gif" | "jpg" | "png" | "webp";
  mimeType: "image/gif" | "image/jpeg" | "image/png" | "image/webp";
};

function beginsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

export function detectSupportedImage(bytes: Uint8Array): SupportedImage | null {
  if (beginsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return { extension: "png", mimeType: "image/png" };
  if (beginsWith(bytes, [0xff, 0xd8, 0xff]))
    return { extension: "jpg", mimeType: "image/jpeg" };
  if (
    beginsWith(bytes, [0x47, 0x49, 0x46, 0x38]) &&
    [0x37, 0x39].includes(bytes[4] ?? 0) &&
    bytes[5] === 0x61
  )
    return { extension: "gif", mimeType: "image/gif" };
  if (
    beginsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return { extension: "webp", mimeType: "image/webp" };
  return null;
}
