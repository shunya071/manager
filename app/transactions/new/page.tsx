import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseDraft } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function NewTransactionPage() {
  if (!env.dbTransactions) {
    return (
      <div className="card">
        <h2>Transactions</h2>
        <p className="muted">NOTION_DATABASE_ID_TRANSACTIONS が未設定です。</p>
      </div>
    );
  }

  const draft = await getDatabaseDraft(env.dbTransactions);

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbTransactions}
        fields={draft.fields}
        title="New Transaction"
        mode="create"
        listRedirectBasePath="/transactions"
        detailRedirectBasePath="/transactions"
      />
    </div>
  );
}
