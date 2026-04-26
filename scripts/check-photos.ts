import { getPhotos } from "../src/lib/notion.ts";

async function main() {
  const r = await getPhotos();
  console.log("Chapter count:", r.length);
  for (const c of r) {
    console.log(`  ${c.chapter}: ${c.photos.length} photos`);
    for (const p of c.photos)
      console.log(
        `    - ${p.title} | date=${p.date} | loc="${p.location}" | url=${p.imageUrl.slice(0, 80)}...`
      );
  }
}
main();
