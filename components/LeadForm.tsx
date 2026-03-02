"use client";

import { useEffect, useState } from "react";
import {
  LEAD_CHANNEL_OPTIONS,
  LEAD_PRIORITY_OPTIONS,
  LEAD_STATUS_OPTIONS
} from "@/lib/constants";
import { useNotionOptions } from "@/lib/useNotionOptions";
import { startLoading, stopLoading } from "@/lib/loading";
import { toastError, toastSuccess } from "@/lib/toast";

export default function LeadForm() {
  const [form, setForm] = useState({
    name: "",
    status: "未接触",
    priority: "A",
    channel: "DM",
    nextAction: "",
    nextActionDate: ""
  });
  const options = useNotionOptions();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      status: options.leads.status.includes(prev.status) ? prev.status : (options.leads.status[0] ?? ""),
      priority: options.leads.priority.includes(prev.priority) ? prev.priority : (options.leads.priority[0] ?? ""),
      channel: options.leads.channel.includes(prev.channel) ? prev.channel : (options.leads.channel[0] ?? "")
    }));
  }, [options]);

  const onChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Name is required");
      toastError("Name is required");
      return;
    }
    setSaving(true);
    startLoading();
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          nextAction: form.nextAction.trim() || null,
          nextActionDate: form.nextActionDate || null
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Failed");
        toastError(data.error ?? "作成に失敗しました。");
        setSaving(false);
        return;
      }

      toastSuccess("作成しました。");
      window.location.href = "/leads";
    } catch {
      setError("Failed");
    } finally {
      setSaving(false);
      stopLoading();
    }
  };

  return (
    <form onSubmit={onSubmit} className="card grid">
      <div>
        <div className="label">Name</div>
        <input className="input" value={form.name} onChange={(e) => onChange("name", e.target.value)} />
      </div>
      <div>
        <div className="label">Status</div>
        <select className="input" value={form.status} onChange={(e) => onChange("status", e.target.value)}>
          {(options.leads.status.length > 0 ? options.leads.status : LEAD_STATUS_OPTIONS).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="label">Priority</div>
        <select className="input" value={form.priority} onChange={(e) => onChange("priority", e.target.value)}>
          {(options.leads.priority.length > 0 ? options.leads.priority : LEAD_PRIORITY_OPTIONS).map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="label">Channel</div>
        <select className="input" value={form.channel} onChange={(e) => onChange("channel", e.target.value)}>
          {(options.leads.channel.length > 0 ? options.leads.channel : LEAD_CHANNEL_OPTIONS).map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="label">Next Action</div>
        <textarea className="input" value={form.nextAction} onChange={(e) => onChange("nextAction", e.target.value)} rows={3} />
      </div>
      <div>
        <div className="label">Next Action Date</div>
        <input className="input" type="date" value={form.nextActionDate} onChange={(e) => onChange("nextActionDate", e.target.value)} />
      </div>
      {error && <div style={{ color: "#a02222" }}>{error}</div>}
      <button type="submit" disabled={saving}>{saving ? "作成中..." : "作成"}</button>
    </form>
  );
}
