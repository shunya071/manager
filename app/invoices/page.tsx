import DatabaseTable from "@/components/DatabaseTable";
import { env } from "@/lib/env";
import { getDatabaseTable } from "@/lib/notion";

export default async function InvoicesPage() {
  if (!env.dbInvoices) {
    return (
      <div className="card">
        <h2>Invoices</h2>
        <p className="muted">NOTION_DATABASE_ID_INVOICES が未設定です。</p>
      </div>
    );
  }

  const table = await getDatabaseTable(env.dbInvoices);

  return (
    <div className="grid">
      <div className="page-header">
        <div>
          <div className="label">Database</div>
          <h1>Invoices</h1>
          {table.title && <div className="muted">{table.title}</div>}
        </div>
      </div>
      <DatabaseTable table={table} databaseId={env.dbInvoices} />
    </div>
  );
}
