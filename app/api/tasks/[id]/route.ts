import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { updateTask } from "@/lib/notion";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await updateTask(params.id, {
      status: body.status ?? undefined,
      dueDate: body.dueDate ?? undefined
    });
    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to update task", 500);
  }
}
