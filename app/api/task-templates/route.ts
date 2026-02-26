import { NextRequest } from "next/server";
import { jsonOk } from "@/lib/api";
import { getTaskTemplatesByGroup } from "@/lib/notion";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group") ?? "";
  const templates = group ? await getTaskTemplatesByGroup(group) : [];
  return jsonOk({ templates });
}
