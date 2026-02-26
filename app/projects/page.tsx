import DatabaseTable from "@/components/DatabaseTable";
import { env } from "@/lib/env";
import { getDatabaseTable } from "@/lib/notion";

export default async function ProjectsPage() {
  if (!env.dbProjects) {
    return (
      <div className="card">
        <h2>Projects</h2>
        <p className="muted">NOTION_DATABASE_ID_PROJECTS が未設定です。</p>
      </div>
    );
  }

  const table = await getDatabaseTable(env.dbProjects);

  return (
    <div className="grid">
      <div className="page-header">
        <div>
          <div className="label">Database</div>
          <h1>Projects</h1>
          {table.title && <div className="muted">{table.title}</div>}
        </div>
      </div>
      <DatabaseTable table={table} databaseId={env.dbProjects} />
    </div>
  );
}
