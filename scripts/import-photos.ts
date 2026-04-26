import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { put } from "@vercel/blob";
import { Client } from "@notionhq/client";
import sharp from "sharp";

const execFileP = promisify(execFile);

const SOURCE =
  "/Users/ahbaik/coding/notebox/Notes/10000_Projects/12000_Build_and_Deploy/12400_2026꿈꽃팩토리/2026-01-15 30photos";

const FOLDER_TO_CHAPTER: Record<string, string> = {
  "00_intro_이스탄불": "00 이스탄불",
  "01_사람이 있는 풍경": "01 사람이 있는 풍경",
  "02_일하는 사람들": "02 일하는 사람들",
  "03_빛과 그림자": "03 빛과 그림자",
  "04_쭈그려 앉기": "04 쭈그려 앉기",
  "05_사라져가는 것들과 상처난 것들": "05 상처난 것들과 사라져 가는 것들",
  "06_자전거": "06 자전거",
  "07_selfie": "07 셀카",
};

const RESIZE_MAX = 2400;
const JPEG_QUALITY = 85;

const ARGS = process.argv.slice(2);
const LIMIT_PER_CHAPTER = (() => {
  const i = ARGS.indexOf("--limit");
  if (i === -1) return Infinity;
  return parseInt(ARGS[i + 1], 10) || Infinity;
})();
const ONLY_CHAPTER = (() => {
  const i = ARGS.indexOf("--chapter");
  return i === -1 ? null : ARGS[i + 1];
})();
const DRY = ARGS.includes("--dry");

interface ExifData {
  date?: string;
  gps?: string;
}

async function readExif(filepath: string): Promise<ExifData> {
  const { stdout } = await execFileP("exiftool", [
    "-j",
    "-DateTimeOriginal",
    "-CreateDate",
    "-GPSLatitude#",
    "-GPSLongitude#",
    filepath,
  ]);
  const [data] = JSON.parse(stdout);
  const raw = data.DateTimeOriginal || data.CreateDate;
  let date: string | undefined;
  if (typeof raw === "string") {
    const datePart = raw.split(" ")[0]?.replace(/:/g, "-");
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) date = datePart;
  }
  let gps: string | undefined;
  if (
    typeof data.GPSLatitude === "number" &&
    typeof data.GPSLongitude === "number"
  ) {
    gps = `${data.GPSLatitude.toFixed(5)}, ${data.GPSLongitude.toFixed(5)}`;
  }
  return { date, gps };
}

async function resizeImage(filepath: string): Promise<Buffer> {
  return sharp(filepath)
    .rotate()
    .resize({
      width: RESIZE_MAX,
      height: RESIZE_MAX,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const NOTION_DS = process.env.NOTION_PHOTOS_DS!;

async function createNotionPage(opts: {
  title: string;
  imageUrl: string;
  chapter: string;
  date?: string;
  location?: string;
  order: number;
}) {
  const properties: Record<string, unknown> = {
    제목: { title: [{ text: { content: opts.title } }] },
    이미지: {
      files: [{ name: opts.title, external: { url: opts.imageUrl } }],
    },
    챕터: { select: { name: opts.chapter } },
    공개: { checkbox: true },
    순서: { number: opts.order },
  };
  if (opts.date) properties["촬영일"] = { date: { start: opts.date } };
  if (opts.location)
    properties["장소"] = {
      rich_text: [{ text: { content: opts.location } }],
    };

  await (notion as any).pages.create({
    parent: { type: "data_source_id", data_source_id: NOTION_DS },
    properties,
  });
}

async function processFile(args: {
  filepath: string;
  filename: string;
  chapter: string;
  chapterId: string;
  order: number;
}) {
  const { filepath, filename, chapter, chapterId, order } = args;
  const stat = await fs.stat(filepath);
  if (stat.size === 0) {
    console.log(`  SKIP empty: ${filename}`);
    return;
  }

  const exif = await readExif(filepath);
  const buf = await resizeImage(filepath);
  const safeName = filename.replace(/\s+/g, "_");
  const blobPath = `photos/${chapterId}/${safeName}`;

  if (DRY) {
    console.log(
      `  [dry] ${filename} (${(buf.length / 1024).toFixed(0)}KB, ${exif.date || "no date"}) → ${blobPath}`
    );
    return;
  }

  const blob = await put(blobPath, buf, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/jpeg",
  });

  const title = path.basename(filename, path.extname(filename));
  await createNotionPage({
    title,
    imageUrl: blob.url,
    chapter,
    date: exif.date,
    location: exif.gps,
    order,
  });
  console.log(
    `  ✓ ${filename} → ${(buf.length / 1024).toFixed(0)}KB ${exif.date || "no-date"}`
  );
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !DRY) {
    console.error("ERROR: BLOB_READ_WRITE_TOKEN env var not set.");
    console.error("Get one from: vercel.com → Storage → Blob → .env.local tab");
    process.exit(1);
  }
  if (!process.env.NOTION_API_KEY || !NOTION_DS) {
    console.error("ERROR: NOTION_API_KEY or NOTION_PHOTOS_DS not set.");
    process.exit(1);
  }

  const folders = await fs.readdir(SOURCE, { withFileTypes: true });
  for (const folder of folders) {
    if (!folder.isDirectory()) continue;
    const chapter = FOLDER_TO_CHAPTER[folder.name];
    if (!chapter) {
      console.log(`SKIP unknown folder: ${folder.name}`);
      continue;
    }
    if (ONLY_CHAPTER && !chapter.startsWith(ONLY_CHAPTER)) continue;

    const chapterId = chapter.split(" ")[0];
    const folderPath = path.join(SOURCE, folder.name);
    const files = (await fs.readdir(folderPath))
      .filter((f) => /\.(jpe?g|png)$/i.test(f) && !f.startsWith("."))
      .sort();

    const limited = files.slice(0, LIMIT_PER_CHAPTER);
    console.log(`\n=== ${chapter} (${limited.length}/${files.length}) ===`);

    let order = 0;
    for (const file of limited) {
      order++;
      try {
        await processFile({
          filepath: path.join(folderPath, file),
          filename: file,
          chapter,
          chapterId,
          order,
        });
      } catch (e: any) {
        console.error(`  ✗ ${file}: ${e?.message ?? e}`);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
