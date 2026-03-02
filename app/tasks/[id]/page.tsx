import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseRecord } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  if (!env.dbTasks) {
    return (
      <div className="card">
        <h2>Tasks</h2>
        <p className="muted">NOTION_DATABASE_ID_TASKS が未設定です。</p>
      </div>
    );
  }

  const record = await getDatabaseRecord(env.dbTasks, params.id);
  if (!record) {
    return (
      <div className="card">
        <h2>Task not found</h2>
      </div>
    );
  }

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbTasks}
        pageId={params.id}
        title={record.title}
        fields={record.fields}
        listRedirectBasePath="/tasks"
      />
    </div>
  );
}
