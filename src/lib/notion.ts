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
  order: number;
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
  const response = await (notion as any).dataSources.query({
    data_source_id: process.env.NOTION_PROJECTS_DS!,
    filter: { property: "공개", checkbox: { equals: true } },
    sorts: [{ property: "순서", direction: "ascending" }],
  });

  return response.results.map((page: any) => ({
    id: page.id,
    title: getPropertyValue(page.properties["제목"]),
    description: getPropertyValue(page.properties["설명"]),
    url: getPropertyValue(page.properties["URL"]),
    screenshot: getPropertyValue(page.properties["스크린샷"]),
    tags: getPropertyValue(page.properties["태그"]),
    order: getPropertyValue(page.properties["순서"]),
  }));
}

export async function getPhotos(): Promise<NotionPhoto[]> {
  const response = await (notion as any).dataSources.query({
    data_source_id: process.env.NOTION_PHOTOS_DS!,
    filter: { property: "공개", checkbox: { equals: true } },
    sorts: [{ property: "순서", direction: "ascending" }],
  });

  return response.results.map((page: any) => ({
    id: page.id,
    title: getPropertyValue(page.properties["제목"]),
    imageUrl: getPropertyValue(page.properties["이미지"]),
    description: getPropertyValue(page.properties["설명"]),
    order: getPropertyValue(page.properties["순서"]),
  }));
}
