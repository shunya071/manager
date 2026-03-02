import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseRecord } from "@/lib/notion";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TransactionDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!env.dbTransactions) {
    return (
      <div className="card">
        <h2>Transactions</h2>
        <p className="muted">NOTION_DATABASE_ID_TRANSACTIONS が未設定です。</p>
      </div>
    );
  }

  const record = await getDatabaseRecord(env.dbTransactions, id);
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
        pageId={id}
        title={record.title}
        fields={record.fields}
        listRedirectBasePath="/transactions"
      />
    </div>
  );
}
