import { jsonOk } from "@/lib/api";
import { env } from "@/lib/env";
import { getDatabaseSelectOptions, type DatabaseSelectOptions } from "@/lib/notion";

export async function GET() {
  const [leadOptions, taskOptions] = await Promise.all([
    env.dbLeads
      ? getDatabaseSelectOptions(env.dbLeads, ["Status", "Priority", "Channel"])
      : Promise.resolve<DatabaseSelectOptions>({}),
    env.dbTasks
      ? getDatabaseSelectOptions(env.dbTasks, ["Status", "Type", "Priority"])
      : Promise.resolve<DatabaseSelectOptions>({})
  ]);

  return jsonOk({
    options: {
      leads: {
        status: leadOptions.Status ?? [],
        priority: leadOptions.Priority ?? [],
        channel: leadOptions.Channel ?? []
      },
      tasks: {
        status: taskOptions.Status ?? [],
        type: taskOptions.Type ?? [],
        priority: taskOptions.Priority ?? []
      }
    }
  });
}
