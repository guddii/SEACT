import type { BinaryLike } from "node:crypto";
import crypto from "node:crypto";

export const createShake256Hash = (
  data: BinaryLike,
  outputLength = 4,
): string => {
  return crypto
    .createHash("shake256", { outputLength })
    .update(data)
    .digest("hex");
};
