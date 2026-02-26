import ClientTasksBoard from "@/components/ClientTasksBoard";
import { getClientById, getClientTasks } from "@/lib/notion";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await getClientById(params.id);
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
      <div className="card">
        <h1>{client.name}</h1>
        <p>Status: {client.status ?? "-"}</p>
        <p>Default Rate: {client.defaultRate ?? "-"}</p>
      </div>
      <ClientTasksBoard clientId={client.id} initialTasks={tasks} />
    </div>
  );
}
