import { QR_ID_LENGTH } from "@/features/qr/constants";

// nanoid's URL-safe alphabet: 64 symbols, so `byte & 63` picks one without bias
const ALPHABET = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

/** a new code's id, generated in the create dialog so the preview encodes the final link */
export const generateQrId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(QR_ID_LENGTH)), (byte) => ALPHABET[byte & 63]).join("");
