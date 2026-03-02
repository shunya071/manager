import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseDraft } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  if (!env.dbClients) {
    return (
      <div className="card">
        <h2>Clients</h2>
        <p className="muted">NOTION_DATABASE_ID_CLIENTS が未設定です。</p>
      </div>
    );
  }

  const draft = await getDatabaseDraft(env.dbClients);

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbClients}
        fields={draft.fields}
        title="New Client"
        mode="create"
        listRedirectBasePath="/clients"
        detailRedirectBasePath="/clients"
      />
    </div>
  );
}
