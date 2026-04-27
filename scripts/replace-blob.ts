import { put } from "@vercel/blob";
import sharp from "sharp";

const args = process.argv.slice(2);
const src = args[0];
const blobPath = args[1];

if (!src || !blobPath) {
  console.error(
    "usage: tsx scripts/replace-blob.ts <source-file> <blob-pathname>"
  );
  console.error(
    "example: tsx scripts/replace-blob.ts /path/R0019607.jpg photos/01/R0019607.jpeg"
  );
  process.exit(1);
}

async function main() {
  const buf = await sharp(src)
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  const blob = await put(blobPath, buf, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/jpeg",
  });

  console.log(`✓ replaced ${blobPath} (${(buf.length / 1024).toFixed(0)}KB)`);
  console.log(`  → ${blob.url}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
