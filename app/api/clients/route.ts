import { jsonOk } from "@/lib/api";
import { getClients } from "@/lib/notion";

export async function GET() {
  const clients = await getClients();
  return jsonOk({ clients });
}
