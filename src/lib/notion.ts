import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export interface NotionProject {
  id: string;
  title: string;
  description: string;
  url: string;
  screenshot: string;
  tags: string[];
  order: number;
}

export interface NotionPhoto {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  location: string;
  date: string;
  order: number;
}

export interface PhotoChapter {
  chapter: string;
  photos: NotionPhoto[];
}

function getPropertyValue(property: any): any {
  switch (property.type) {
    case "title":
      return property.title.map((t: any) => t.plain_text).join("");
    case "rich_text":
      return property.rich_text.map((t: any) => t.plain_text).join("");
    case "url":
      return property.url ?? "";
    case "checkbox":
      return property.checkbox;
    case "number":
      return property.number ?? 0;
    case "select":
      return property.select?.name ?? "";
    case "multi_select":
      return property.multi_select.map((s: any) => s.name);
    case "files":
      if (property.files.length === 0) return "";
      const file = property.files[0];
      return file.type === "file" ? file.file.url : file.external?.url ?? "";
    case "date":
      return property.date?.start ?? "";
    default:
      return "";
  }
}

export async function getProjects(): Promise<NotionProject[]> {
  const results = await queryAll(
    process.env.NOTION_PROJECTS_DS!,
    { property: "공개", checkbox: { equals: true } },
    [{ property: "순서", direction: "ascending" }]
  );

  return results.map((page: any) => ({
    id: page.id,
    title: getPropertyValue(page.properties["제목"]),
    description: getPropertyValue(page.properties["설명"]),
    url: getPropertyValue(page.properties["URL"]),
    screenshot: getPropertyValue(page.properties["스크린샷"]),
    tags: getPropertyValue(page.properties["태그"]),
    order: getPropertyValue(page.properties["순서"]),
  }));
}

async function queryAll(dataSourceId: string, filter: any, sorts: any[]) {
  const all: any[] = [];
  let cursor: string | undefined;
  do {
    const response = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      filter,
      sorts,
      start_cursor: cursor,
    });
    all.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return all;
}

export async function getPhotos(): Promise<PhotoChapter[]> {
  const results = await queryAll(
    process.env.NOTION_PHOTOS_DS!,
    { property: "공개", checkbox: { equals: true } },
    [{ property: "순서", direction: "ascending" }]
  );

  const photos: (NotionPhoto & { chapter: string })[] = results.map(
    (page: any) => ({
      id: page.id,
      title: getPropertyValue(page.properties["제목"]),
      imageUrl: getPropertyValue(page.properties["이미지"]),
      description: getPropertyValue(page.properties["설명"]),
      location: getPropertyValue(page.properties["장소"]),
      date: getPropertyValue(page.properties["촬영일"]),
      order: getPropertyValue(page.properties["순서"]),
      chapter: getPropertyValue(page.properties["챕터"]),
    })
  );

  const grouped = new Map<string, NotionPhoto[]>();
  for (const { chapter, ...photo } of photos) {
    if (!chapter) continue;
    if (!grouped.has(chapter)) grouped.set(chapter, []);
    grouped.get(chapter)!.push(photo);
  }

  return Array.from(grouped.entries())
    .map(([chapter, photos]) => ({ chapter, photos }))
    .sort((a, b) => a.chapter.localeCompare(b.chapter));
}
