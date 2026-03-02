import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseRecord } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function TransactionDetailPage({ params }: { params: { id: string } }) {
  if (!env.dbTransactions) {
    return (
      <div className="card">
        <h2>Transactions</h2>
        <p className="muted">NOTION_DATABASE_ID_TRANSACTIONS が未設定です。</p>
      </div>
    );
  }

  const record = await getDatabaseRecord(env.dbTransactions, params.id);
  if (!record) {
    return (
      <div className="card">
        <h2>Transaction not found</h2>
      </div>
    );
  }

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbTransactions}
        pageId={params.id}
        title={record.title}
        fields={record.fields}
        listRedirectBasePath="/transactions"
      />
    </div>
  );
}
