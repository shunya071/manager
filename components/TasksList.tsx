"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TaskListItem } from "@/lib/notion";

type Props = {
  items: TaskListItem[];
  createHref?: string;
};

const toEditHref = (id: string) => `/tasks/${id}`;

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  "未着手": { bg: "#f2efe9", text: "#5b4f45", border: "#d9cfc2" },
  "進行中": { bg: "#e8f6ff", text: "#0b4e8a", border: "#b9dbf5" },
  "完了": { bg: "#e8f6ee", text: "#0d5f3a", border: "#b8e0c9" },
  "保留": { bg: "#fff3e0", text: "#7a3d00", border: "#f2d4b2" }
};

const getStatusStyle = (status: string) => {
  if (statusColors[status]) return statusColors[status];
  const hue = Math.abs(Array.from(status).reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 360;
  return {
    bg: `hsl(${hue} 70% 94%)`,
    text: `hsl(${hue} 45% 28%)`,
    border: `hsl(${hue} 40% 78%)`
  };
};

const parseDate = (value: string) => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "-") return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sortByDueDateAsc = (a: TaskListItem, b: TaskListItem) => {
  const aDate = parseDate(a.dueDate);
  const bDate = parseDate(b.dueDate);
  if (aDate && bDate) return aDate.getTime() - bDate.getTime();
  if (aDate) return -1;
  if (bDate) return 1;
  return a.title.localeCompare(b.title);
};

const sortByDueDateDesc = (a: TaskListItem, b: TaskListItem) => {
  const aDate = parseDate(a.dueDate);
  const bDate = parseDate(b.dueDate);
  if (aDate && bDate) return bDate.getTime() - aDate.getTime();
  if (aDate) return -1;
  if (bDate) return 1;
  return a.title.localeCompare(b.title);
};

export default function TasksList({ items, createHref }: Props) {
  const [status, setStatus] = useState("all");
  const [client, setClient] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("due_asc");

  const statusOptions = useMemo(() => {
    const set = new Set(items.map((item) => item.status).filter((value) => value && value !== "-"));
    return ["all", ...Array.from(set)];
  }, [items]);

  const clientOptions = useMemo(() => {
    const set = new Set(items.map((item) => item.client).filter((value) => value && value !== "-"));
    return ["all", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let list = items.slice();
    if (status !== "all") {
      list = list.filter((item) => item.status === status);
    }
    if (client !== "all") {
      list = list.filter((item) => item.client === client);
    }
    if (keyword) {
      list = list.filter((item) => {
        return (
          item.title.toLowerCase().includes(keyword) ||
          item.note.toLowerCase().includes(keyword)
        );
      });
    }
    switch (sort) {
      case "due_desc":
        return list.sort(sortByDueDateDesc);
      case "title":
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case "due_asc":
      default:
        return list.sort(sortByDueDateAsc);
    }
  }, [items, status, client, search, sort]);

  return (
    <div className="grid">
      <div className="card table-toolbar">
        <div className="muted">{filtered.length}件</div>
        {createHref && (
          <Link href={createHref} className="button-link">
            新規作成
          </Link>
        )}
      </div>

      <div className="card filters">
        <div>
          <div className="label">ステータス</div>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "すべて" : option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="label">クライアント</div>
          <select className="input" value={client} onChange={(e) => setClient(e.target.value)}>
            {clientOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "すべて" : option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="label">検索</div>
          <input
            className="input"
            placeholder="タイトル / ノート"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <div className="label">並び替え</div>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="due_asc">期日が近い順</option>
            <option value="due_desc">期日が遠い順</option>
            <option value="title">タイトル順</option>
          </select>
        </div>
      </div>

      <div className="card task-list">
        <div className="task-row task-row-head">
          <div>タイトル</div>
          <div>優先度</div>
          <div>タイプ</div>
          <div>期日</div>
          <div>ステータス</div>
          <div>クライアント</div>
          <div>ノート</div>
        </div>
        {filtered.map((item) => {
          const style = getStatusStyle(item.status);
          return (
            <div key={item.id} className="task-row">
              <div data-label="タイトル">
                <Link className="task-link" href={toEditHref(item.id)}>{item.title}</Link>
              </div>
              <div data-label="優先度">{item.priority}</div>
              <div data-label="タイプ">{item.type}</div>
              <div data-label="期日">{item.dueDate}</div>
              <div data-label="ステータス">
                <span
                  className="status-pill"
                  style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
                >
                  {item.status}
                </span>
              </div>
              <div data-label="クライアント">{item.client}</div>
              <div data-label="ノート">{item.note}</div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="muted" style={{ padding: "12px 6px" }}>該当するタスクがありません。</div>
        )}
      </div>
    </div>
  );
}
