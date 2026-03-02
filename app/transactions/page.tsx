import CompactList from "@/components/CompactList";
import { env } from "@/lib/env";
import { getDatabaseTable } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  if (!env.dbTransactions) {
    return (
      <div className="card">
        <h2>Transactions</h2>
        <p className="muted">NOTION_DATABASE_ID_TRANSACTIONS が未設定です。</p>
      </div>
    );
  }

  const table = await getDatabaseTable(env.dbTransactions);

  return (
    <div className="grid">
      <div className="page-header">
        <div>
          <div className="label">Database</div>
          <h1>Transactions</h1>
          {table.title && <div className="muted">{table.title}</div>}
        </div>
      </div>
      <CompactList
        table={table}
        titleLinkBasePath="/transactions"
        rowEditHrefBasePath="/transactions"
        createHref="/transactions/new"
      />
    </div>
  );
}
