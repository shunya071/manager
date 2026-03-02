import { env } from "@/lib/env";
import { getTasksList } from "@/lib/notion";
import TasksList from "@/components/TasksList";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  if (!env.dbTasks) {
    return (
      <div className="card">
        <h2>Tasks</h2>
        <p className="muted">NOTION_DATABASE_ID_TASKS が未設定です。</p>
      </div>
    );
  }

  const items = await getTasksList(env.dbTasks);

  return (
    <div className="grid">
      <div className="page-header">
        <div>
          <div className="label">Database</div>
          <h1>Tasks</h1>
        </div>
      </div>
      <TasksList items={items} createHref="/tasks/new" />
    </div>
  );
}
