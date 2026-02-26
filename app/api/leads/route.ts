import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { createLead, generateTasksFromTemplates, getLeads, getTaskTemplatesByGroup, updateLead } from "@/lib/notion";
import { TEMPLATE_GROUP_SALES } from "@/lib/constants";

export async function GET() {
  const leads = await getLeads();
  return jsonOk({ leads });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return jsonError("Name is required");
    }

    const lead = await createLead({
      name,
      status: body.status ?? null,
      priority: body.priority ?? null,
      channel: body.channel ?? null,
      nextAction: body.nextAction ?? null,
      nextActionDate: body.nextActionDate ?? null,
      clientId: body.clientId ?? null
    });

    const templates = await getTaskTemplatesByGroup(TEMPLATE_GROUP_SALES);
    if (templates.length > 0) {
      await generateTasksFromTemplates({
        leadId: lead.id,
        clientId: lead.clientId,
        createdAt: new Date(),
        templates
      });
      await updateLead(lead.id, { autoTasksCreated: true });
    }

    return jsonOk({ leadId: lead.id });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to create lead", 500);
  }
}
