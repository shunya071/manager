import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { updateDatabaseRecord } from "@/lib/notion";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const databaseId = typeof body.databaseId === "string" ? body.databaseId : "";
    const updates = body.updates && typeof body.updates === "object" ? body.updates : null;
    if (!databaseId || !updates) {
      return jsonError("Invalid payload");
    }
    await updateDatabaseRecord(databaseId, params.id, updates);
    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to update page", 500);
  }
}
