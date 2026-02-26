import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { createTask } from "@/lib/notion";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return jsonError("Name is required");
    }

    const taskId = await createTask({
      name,
      clientId: body.clientId ?? null,
      leadId: body.leadId ?? null,
      status: body.status ?? null,
      type: body.type ?? null,
      priority: body.priority ?? null,
      dueDate: body.dueDate ?? null,
      estimateMinutes: body.estimateMinutes ?? null,
      billable: body.billable ?? true,
      parentTaskId: body.parentTaskId ?? null
    });

    return jsonOk({ taskId });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to create task", 500);
  }
}
