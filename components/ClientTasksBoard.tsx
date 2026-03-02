"use client";

import { useMemo, useState } from "react";
import { TASK_STATUS_OPTIONS } from "@/lib/constants";
import type { Task } from "@/lib/notion";
import { useNotionOptions } from "@/lib/useNotionOptions";
import { startLoading, stopLoading } from "@/lib/loading";
import { toastError, toastSuccess } from "@/lib/toast";

export default function ClientTasksBoard({ clientId, initialTasks }: { clientId: string; initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [name, setName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const options = useNotionOptions();
  const statusOptions = options.tasks.status.length > 0 ? options.tasks.status : TASK_STATUS_OPTIONS;

  const orderedStatuses = useMemo(() => {
    const list = [...statusOptions];
    const set = new Set(list);
    tasks.forEach((task) => {
      const key = task.status ?? "Backlog";
      if (!set.has(key)) {
        set.add(key);
        list.push(key);
      }
    });
    return list;
  }, [statusOptions, tasks]);

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = {};
    orderedStatuses.forEach((status) => {
      map[status] = [];
    });
    tasks.forEach((task) => {
      const key = task.status ?? "Backlog";
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [tasks, orderedStatuses]);

  const createTask = async () => {
    if (!name.trim()) return;
    startLoading();
    const defaultStatus = statusOptions[0] ?? "未着手";
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          clientId,
          status: defaultStatus
        })
      });
      if (response.ok) {
        const data = await response.json();
        setTasks((prev) => [
          { id: data.taskId, name: name.trim(), status: defaultStatus, type: null, priority: null, dueDate: null, estimateMinutes: null, billable: true, clientId, leadId: null, parentTaskId: null },
          ...prev
        ]);
        setName("");
        toastSuccess("タスクを追加しました。");
      } else {
        toastError("タスク追加に失敗しました。");
      }
    } finally {
      stopLoading();
    }
  };

  const updateStatus = async (taskId: string, status: string) => {
    setSavingId(taskId);
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
    startLoading();
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        toastError("更新に失敗しました。");
      }
    } finally {
      stopLoading();
      setSavingId(null);
    }
  };

  const updateDueDate = async (taskId: string, dueDate: string) => {
    setSavingId(taskId);
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, dueDate } : task)));
    startLoading();
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: dueDate || null })
      });
      if (!response.ok) {
        toastError("更新に失敗しました。");
      }
    } finally {
      stopLoading();
      setSavingId(null);
    }
  };

  return (
    <div className="grid">
      <div className="card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input
          className="input"
          placeholder="新しいタスク名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="button" onClick={createTask}>追加</button>
      </div>

      <div className="grid grid-2">
        {orderedStatuses.map((status) => (
          <div key={status} className="column">
            <div className="badge">{status}</div>
            <div style={{ marginTop: 8 }}>
              {(grouped[status] ?? []).map((task) => (
                <div key={task.id} className="task">
                  <strong>{task.name}</strong>
                  <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                    <select
                      className="input"
                      value={task.status ?? ""}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      disabled={savingId === task.id}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <input
                      className="input"
                      type="date"
                      value={task.dueDate ?? ""}
                      onChange={(e) => updateDueDate(task.id, e.target.value)}
                      disabled={savingId === task.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
