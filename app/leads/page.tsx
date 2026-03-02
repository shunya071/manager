import CompactList from "@/components/CompactList";
import { env } from "@/lib/env";
import { getDatabaseTable } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const table = await getDatabaseTable(env.dbLeads);

  return (
    <div className="grid">
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>Leads</h1>
      </div>
      <CompactList
        table={table}
        createHref="/leads/new"
        titleLinkBasePath="/leads"
        rowEditHrefBasePath="/leads"
      />
    </div>
  );
}
