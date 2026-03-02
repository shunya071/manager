import CompactList from "@/components/CompactList";
import { env } from "@/lib/env";
import { getDatabaseTable } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const table = await getDatabaseTable(env.dbClients);

  return (
    <div className="grid">
      <h1>Clients</h1>
      <CompactList
        table={table}
        titleLinkBasePath="/clients"
        rowEditHrefBasePath="/clients"
        createHref="/clients/new"
      />
    </div>
  );
}
