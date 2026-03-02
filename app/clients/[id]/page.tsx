import ClientTasksBoard from "@/components/ClientTasksBoard";
import RecordEditor from "@/components/RecordEditor";
import { env } from "@/lib/env";
import { getClientTasks, getDatabaseRecord } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  if (!env.dbClients) {
    return (
      <div className="card">
        <h2>Clients</h2>
        <p className="muted">NOTION_DATABASE_ID_CLIENTS が未設定です。</p>
      </div>
    );
  }

  const client = await getDatabaseRecord(env.dbClients, params.id);
  const tasks = await getClientTasks(params.id);

  if (!client) {
    return (
      <div className="card">
        <h2>Client not found</h2>
      </div>
    );
  }

  return (
    <div className="grid">
      <RecordEditor
        databaseId={env.dbClients}
        pageId={params.id}
        title={client.title}
        fields={client.fields}
        listRedirectBasePath="/clients"
      />
      <ClientTasksBoard clientId={params.id} initialTasks={tasks} />
    </div>
  );
}
