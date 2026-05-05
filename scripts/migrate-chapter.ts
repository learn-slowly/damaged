import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const FROM = "07 셀카";
const TO = "07 셀피";

async function main() {
  const dsId = process.env.NOTION_PHOTOS_DS!;

  let cursor: string | undefined;
  let total = 0;

  do {
    const res = await (notion as any).dataSources.query({
      data_source_id: dsId,
      filter: { property: "챕터", select: { equals: FROM } },
      start_cursor: cursor,
    });

    for (const page of res.results) {
      await notion.pages.update({
        page_id: page.id,
        properties: { 챕터: { select: { name: TO } } },
      });
      total++;
      console.log(`migrated ${page.id}`);
    }

    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  console.log(`\nDone. Migrated ${total} photos: "${FROM}" → "${TO}"`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
