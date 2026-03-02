"use client";

import { useState } from "react";
import { LEAD_PRIORITY_OPTIONS, LEAD_STATUS_OPTIONS } from "@/lib/constants";
import type { Lead } from "@/lib/notion";
import { useNotionOptions } from "@/lib/useNotionOptions";
import { startLoading, stopLoading } from "@/lib/loading";
import { toastError } from "@/lib/toast";

export default function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [saving, setSaving] = useState<string | null>(null);
  const options = useNotionOptions();

  const updateLead = async (id: string, patch: Partial<Pick<Lead, "status" | "priority">>) => {
    setSaving(id);
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead)));
    startLoading();
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      if (!response.ok) {
        toastError("更新に失敗しました。");
      }
    } finally {
      stopLoading();
      setSaving(null);
    }
  };

  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Next Action Date</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>
                <select
                  className="input"
                  value={lead.status ?? ""}
                  onChange={(event) => updateLead(lead.id, { status: event.target.value })}
                  disabled={saving === lead.id}
                >
                  <option value="">-</option>
                  {(options.leads.status.length > 0 ? options.leads.status : LEAD_STATUS_OPTIONS).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  className="input"
                  value={lead.priority ?? ""}
                  onChange={(event) => updateLead(lead.id, { priority: event.target.value })}
                  disabled={saving === lead.id}
                >
                  <option value="">-</option>
                  {(options.leads.priority.length > 0 ? options.leads.priority : LEAD_PRIORITY_OPTIONS).map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </td>
              <td>{lead.nextActionDate ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
