import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getDatabaseRecord } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  if (!env.dbLeads) {
    return (
      <div className="card">
        <h2>Leads</h2>
        <p className="muted">NOTION_DATABASE_ID_LEADS が未設定です。</p>
      </div>
    );
  }

  const lead = await getDatabaseRecord(env.dbLeads, params.id);
  if (!lead) {
    return (
      <div className="card">
        <h2>Lead not found</h2>
      </div>
    );
  }

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbLeads}
        pageId={params.id}
        title={lead.title}
        fields={lead.fields}
        listRedirectBasePath="/leads"
      />
    </div>
  );
}
