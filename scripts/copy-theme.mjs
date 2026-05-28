import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "src/styles/theme.css");
const dest = resolve(root, "dist/theme.css");

await mkdir(dirname(dest), { recursive: true });
await copyFile(src, dest);
console.log("Copied theme.css -> dist/theme.css");
