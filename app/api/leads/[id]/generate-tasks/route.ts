import { jsonError, jsonOk } from "@/lib/api";
import { generateTasksFromTemplates, getTaskTemplatesByGroup, updateLead } from "@/lib/notion";
import { TEMPLATE_GROUP_SALES } from "@/lib/constants";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const templates = await getTaskTemplatesByGroup(TEMPLATE_GROUP_SALES);
    if (templates.length === 0) {
      return jsonOk({ created: 0 });
    }

    await generateTasksFromTemplates({
      leadId: params.id,
      createdAt: new Date(),
      templates
    });

    await updateLead(params.id, { autoTasksCreated: true });

    return jsonOk({ created: templates.length });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to generate tasks", 500);
  }
}
