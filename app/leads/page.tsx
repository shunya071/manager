import DatabaseTable from "@/components/DatabaseTable";
import { env } from "@/lib/env";
import { getDatabaseTable } from "@/lib/notion";

export default async function LeadsPage() {
  const table = await getDatabaseTable(env.dbLeads);

  return (
    <div className="grid">
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>Leads</h1>
      </div>
      <DatabaseTable table={table} databaseId={env.dbLeads} createHref="/leads/new" />
    </div>
  );
}
