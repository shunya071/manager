import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseDraft } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  if (!env.dbProjects) {
    return (
      <div className="card">
        <h2>Projects</h2>
        <p className="muted">NOTION_DATABASE_ID_PROJECTS が未設定です。</p>
      </div>
    );
  }

  const draft = await getDatabaseDraft(env.dbProjects);

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbProjects}
        fields={draft.fields}
        title="New Project"
        mode="create"
        listRedirectBasePath="/projects"
        detailRedirectBasePath="/projects"
      />
    </div>
  );
}
