import DatabaseTable from "@/components/DatabaseTable";
import { env } from "@/lib/env";
import { getDatabaseTable } from "@/lib/notion";

export default async function ClientsPage() {
  const table = await getDatabaseTable(env.dbClients);

  return (
    <div className="grid">
      <h1>Clients</h1>
      <DatabaseTable
        table={table}
        titleLinkBasePath="/clients"
        rowEditHrefBasePath="/clients"
        databaseId={env.dbClients}
      />
    </div>
  );
}
