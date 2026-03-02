import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { updateLead } from "@/lib/notion";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    await updateLead(id, {
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
