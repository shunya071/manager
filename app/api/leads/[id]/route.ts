import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { updateLead } from "@/lib/notion";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await updateLead(params.id, {
      status: body.status ?? undefined,
      priority: body.priority ?? undefined,
      autoTasksCreated: body.autoTasksCreated ?? undefined
    });
    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to update lead", 500);
  }
}
