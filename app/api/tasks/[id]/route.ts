import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { updateTask } from "@/lib/notion";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    await updateTask(id, {
      status: body.status ?? undefined,
      dueDate: body.dueDate ?? undefined
    });
    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to update task", 500);
  }
}
