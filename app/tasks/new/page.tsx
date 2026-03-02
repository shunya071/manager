import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseDraft } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  if (!env.dbTasks) {
    return (
      <div className="card">
        <h2>Tasks</h2>
        <p className="muted">NOTION_DATABASE_ID_TASKS が未設定です。</p>
      </div>
    );
  }

  const draft = await getDatabaseDraft(env.dbTasks);

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbTasks}
        fields={draft.fields}
        title="New Task"
        mode="create"
        listRedirectBasePath="/tasks"
        detailRedirectBasePath="/tasks"
      />
    </div>
  );
}
