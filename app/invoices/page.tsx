import CompactList from "@/components/CompactList";
import { env } from "@/lib/env";
import { getDatabaseTable } from "@/lib/notion";

export const dynamic = "force-dynamic";

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
      <CompactList
        table={table}
        titleLinkBasePath="/invoices"
        rowEditHrefBasePath="/invoices"
        createHref="/invoices/new"
      />
    </div>
  );
}
