import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseRecord } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  if (!env.dbInvoices) {
    return (
      <div className="card">
        <h2>Invoices</h2>
        <p className="muted">NOTION_DATABASE_ID_INVOICES が未設定です。</p>
      </div>
    );
  }

  const record = await getDatabaseRecord(env.dbInvoices, params.id);
  if (!record) {
    return (
      <div className="card">
        <h2>Invoice not found</h2>
      </div>
    );
  }

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbInvoices}
        pageId={params.id}
        title={record.title}
        fields={record.fields}
        listRedirectBasePath="/invoices"
      />
    </div>
  );
}
