import { Client } from "@notionhq/client";

const notion: any = new Client({ auth: process.env.NOTION_API_KEY });
const DS = process.env.NOTION_PHOTOS_DS!;

async function fetchAll() {
  const all: any[] = [];
  let cursor: string | undefined;
  do {
    const r = await notion.dataSources.query({
      data_source_id: DS,
      page_size: 100,
      start_cursor: cursor,
    });
    all.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return all;
}

async function main() {
  const all = await fetchAll();
  console.log(`Found ${all.length} entries in DB.`);

  const empty = all.filter(
    (p) => !p.properties["제목"]?.title?.[0]?.plain_text
  );
  console.log(`Empty entries: ${empty.length}`);

  const unpublished = all.filter(
    (p) =>
      p.properties["공개"]?.checkbox !== true &&
      p.properties["제목"]?.title?.[0]?.plain_text
  );
  console.log(`Unpublished entries: ${unpublished.length}`);

  const byTitle = new Map<string, any[]>();
  for (const p of all) {
    const title = p.properties["제목"]?.title?.[0]?.plain_text;
    const chapter = p.properties["챕터"]?.select?.name ?? "";
    if (!title) continue;
    const key = `${chapter}|${title}`;
    if (!byTitle.has(key)) byTitle.set(key, []);
    byTitle.get(key)!.push(p);
  }
  const dups = [...byTitle.entries()].filter(([, v]) => v.length > 1);
  console.log(`Duplicate (chapter+title) groups: ${dups.length}`);
  for (const [k, v] of dups) console.log(`  ${k}: ${v.length} entries`);

  // Delete empty entries
  for (const p of empty) {
    await notion.pages.update({ page_id: p.id, archived: true });
    console.log(`  archived empty: ${p.id.slice(0, 8)}`);
  }

  // Set 공개=true on unpublished real entries
  for (const p of unpublished) {
    await notion.pages.update({
      page_id: p.id,
      properties: { 공개: { checkbox: true } },
    });
    const title = p.properties["제목"]?.title?.[0]?.plain_text;
    console.log(`  published: ${title} (${p.id.slice(0, 8)})`);
  }

  // Archive duplicates (keep one)
  for (const [key, group] of dups) {
    for (const p of group.slice(1)) {
      await notion.pages.update({ page_id: p.id, archived: true });
      console.log(`  archived dup: ${key} (${p.id.slice(0, 8)})`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
