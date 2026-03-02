import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseDraft } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  if (!env.dbInvoices) {
    return (
      <div className="card">
        <h2>Invoices</h2>
        <p className="muted">NOTION_DATABASE_ID_INVOICES が未設定です。</p>
      </div>
    );
  }

  const draft = await getDatabaseDraft(env.dbInvoices);

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbInvoices}
        fields={draft.fields}
        title="New Invoice"
        mode="create"
        listRedirectBasePath="/invoices"
        detailRedirectBasePath="/invoices"
      />
    </div>
  );
}
