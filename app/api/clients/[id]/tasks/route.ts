import { jsonOk } from "@/lib/api";
import { getClientTasks } from "@/lib/notion";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const tasks = await getClientTasks(id);
  return jsonOk({ tasks });
}
