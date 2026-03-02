import { jsonError, jsonOk } from "@/lib/api";
import { generateTasksFromTemplates, getTaskTemplatesByGroup, updateLead } from "@/lib/notion";
import { TEMPLATE_GROUP_SALES } from "@/lib/constants";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const templates = await getTaskTemplatesByGroup(TEMPLATE_GROUP_SALES);
    if (templates.length === 0) {
      return jsonOk({ created: 0 });
    }

    await generateTasksFromTemplates({
      leadId: id,
      createdAt: new Date(),
      templates
    });

    await updateLead(id, { autoTasksCreated: true });

    return jsonOk({ created: templates.length });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to generate tasks", 500);
  }
}
