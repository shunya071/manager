"use client";

import { useState } from "react";
import {
  LEAD_CHANNEL_OPTIONS,
  LEAD_PRIORITY_OPTIONS,
  LEAD_STATUS_OPTIONS
} from "@/lib/constants";

export default function LeadForm() {
  const [form, setForm] = useState({
    name: "",
    status: "未接触",
    priority: "A",
    channel: "DM",
    nextAction: "",
    nextActionDate: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
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
      setSaving(false);
      return;
    }

    window.location.href = "/leads";
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
          {LEAD_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="label">Priority</div>
        <select className="input" value={form.priority} onChange={(e) => onChange("priority", e.target.value)}>
          {LEAD_PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="label">Channel</div>
        <select className="input" value={form.channel} onChange={(e) => onChange("channel", e.target.value)}>
          {LEAD_CHANNEL_OPTIONS.map((channel) => (
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
