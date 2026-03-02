import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseRecord } from "@/lib/notion";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!env.dbTasks) {
    return (
      <div className="card">
        <h2>Tasks</h2>
        <p className="muted">NOTION_DATABASE_ID_TASKS が未設定です。</p>
      </div>
    );
  }

  const record = await getDatabaseRecord(env.dbTasks, id);
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
        pageId={id}
        title={record.title}
        fields={record.fields}
        listRedirectBasePath="/tasks"
      />
    </div>
  );
}
