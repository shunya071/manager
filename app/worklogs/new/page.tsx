import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseDraft } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function NewWorkLogPage() {
  if (!env.dbWorkLogs) {
    return (
      <div className="card">
        <h2>WorkLogs</h2>
        <p className="muted">NOTION_DATABASE_ID_WORKLOGS が未設定です。</p>
      </div>
    );
  }

  const draft = await getDatabaseDraft(env.dbWorkLogs);

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbWorkLogs}
        fields={draft.fields}
        title="New WorkLog"
        mode="create"
        listRedirectBasePath="/worklogs"
        detailRedirectBasePath="/worklogs"
      />
    </div>
  );
}
