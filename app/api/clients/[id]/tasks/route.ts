import { jsonOk } from "@/lib/api";
import { getClientTasks } from "@/lib/notion";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const tasks = await getClientTasks(params.id);
  return jsonOk({ tasks });
}
