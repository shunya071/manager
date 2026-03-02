import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseRecord } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  if (!env.dbProjects) {
    return (
      <div className="card">
        <h2>Projects</h2>
        <p className="muted">NOTION_DATABASE_ID_PROJECTS が未設定です。</p>
      </div>
    );
  }

  const project = await getDatabaseRecord(env.dbProjects, params.id);
  if (!project) {
    return (
      <div className="card">
        <h2>Project not found</h2>
      </div>
    );
  }

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbProjects}
        pageId={params.id}
        title={project.title}
        fields={project.fields}
        listRedirectBasePath="/projects"
      />
    </div>
  );
}
