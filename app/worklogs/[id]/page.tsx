import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseRecord } from "@/lib/notion";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WorkLogDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!env.dbWorkLogs) {
    return (
      <div className="card">
        <h2>WorkLogs</h2>
        <p className="muted">NOTION_DATABASE_ID_WORKLOGS が未設定です。</p>
      </div>
    );
  }

  const record = await getDatabaseRecord(env.dbWorkLogs, id);
  if (!record) {
    return (
      <div className="card">
        <h2>WorkLog not found</h2>
      </div>
    );
  }

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbWorkLogs}
        pageId={id}
        title={record.title}
        fields={record.fields}
        listRedirectBasePath="/worklogs"
      />
    </div>
  );
}
