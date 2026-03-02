import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { createDatabaseRecord } from "@/lib/notion";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const databaseId = typeof body.databaseId === "string" ? body.databaseId : "";
    const updates = body.updates && typeof body.updates === "object" ? body.updates : null;
    if (!databaseId || !updates) {
      return jsonError("Invalid payload");
    }
    const pageId = await createDatabaseRecord(databaseId, updates);
    return jsonOk({ pageId });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to create page", 500);
  }
}
