"use client";

import { useMemo, useState } from "react";
import type { DatabaseRecordField } from "@/lib/notion";
import { startLoading, stopLoading } from "@/lib/loading";
import { toastError, toastSuccess } from "@/lib/toast";

type Props = {
  databaseId: string;
  pageId?: string;
  title?: string;
  fields: DatabaseRecordField[];
  mode?: "edit" | "create";
  listRedirectBasePath?: string;
  detailRedirectBasePath?: string;
};

type ValueMap = Record<string, string | number | boolean>;

const isCheckbox = (field: DatabaseRecordField) => field.type === "checkbox";
const isMultiSelect = (field: DatabaseRecordField) => field.type === "multi_select";
const isRelation = (field: DatabaseRecordField) => field.type === "relation";
const isSelect = (field: DatabaseRecordField) => field.type === "select" || field.type === "status";

const getInputType = (field: DatabaseRecordField) => {
  if (field.type === "number") return "number";
  if (field.type === "date") return "date";
  if (field.type === "email") return "email";
  if (field.type === "phone_number") return "tel";
  if (field.type === "url") return "url";
  return "text";
};

export default function RecordEditor({
  databaseId,
  pageId,
  title,
  fields,
  mode = "edit",
  listRedirectBasePath,
  detailRedirectBasePath
}: Props) {
  const initial = useMemo(() => {
    const map: ValueMap = {};
    fields.forEach((field) => {
      map[field.key] = field.value ?? "";
    });
    return map;
  }, [fields]);

  const [values, setValues] = useState<ValueMap>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectAfterSave, setRedirectAfterSave] = useState<"stay" | "list" | "detail">("stay");
  const titleField = fields.find((field) => field.type === "title");

  const onChange = (key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (titleField) {
      const currentTitle = values[titleField.key];
      if (typeof currentTitle !== "string" || !currentTitle.trim()) {
        setError("タイトルは必須です。");
        toastError("タイトルは必須です。");
        return;
      }
    }
    setSaving(true);
    setError(null);
    startLoading();
    try {
      const response = await fetch(
        mode === "create" ? "/api/pages" : `/api/pages/${pageId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            databaseId,
            updates: values
          })
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Failed");
        toastError(data.error ?? "保存に失敗しました。");
        return;
      }
      toastSuccess(mode === "create" ? "作成しました。" : "保存しました。");
      const data = await response.json().catch(() => ({}));
      if (mode === "create") {
        if (redirectAfterSave === "list" && listRedirectBasePath) {
          window.location.href = listRedirectBasePath;
          return;
        }
        if (redirectAfterSave === "detail" && detailRedirectBasePath && data?.pageId) {
          window.location.href = `${detailRedirectBasePath}/${data.pageId}`;
          return;
        }
      }
      if (mode === "edit" && redirectAfterSave === "list" && listRedirectBasePath) {
        window.location.href = listRedirectBasePath;
        return;
      }
    } catch {
      setError("Failed");
    } finally {
      setSaving(false);
      stopLoading();
    }
  };

  return (
    <form onSubmit={onSubmit} className="card grid">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="label">Record</div>
          <h1>{title || "Edit"}</h1>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            onClick={() => setRedirectAfterSave(mode === "create" ? "detail" : "stay")}
          >
            {saving ? (mode === "create" ? "作成中..." : "保存中...") : (mode === "create" ? "作成" : "保存")}
          </button>
          {listRedirectBasePath && (
            <button
              type="submit"
              className="secondary"
              disabled={saving}
              onClick={() => setRedirectAfterSave("list")}
            >
              {saving ? "処理中..." : (mode === "create" ? "作成して一覧へ戻る" : "保存して一覧へ戻る")}
            </button>
          )}
        </div>
      </div>

      {fields.map((field) => {
        if (mode === "create" && !field.editable) {
          return null;
        }
        const value = values[field.key];
        if (!field.editable) {
          return (
            <div key={field.key}>
              <div className="label">{field.name}</div>
              <div className="input" style={{ background: "#f2f2f2" }}>
                {String(field.display ?? field.value ?? "-")}
              </div>
            </div>
          );
        }

        if (isCheckbox(field)) {
          return (
            <label key={field.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => onChange(field.key, e.target.checked)}
              />
              <span>{field.name}</span>
            </label>
          );
        }

        if (isSelect(field)) {
          const options = field.options ?? [];
          return (
            <div key={field.key}>
              <div className="label">{field.name}</div>
              <select
                className="input"
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(field.key, e.target.value)}
              >
                <option value="">-</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (isMultiSelect(field)) {
          return (
            <div key={field.key}>
              <div className="label">{field.name}</div>
              <input
                className="input"
                placeholder="例: A, B, C"
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
              <div className="muted" style={{ marginTop: 6 }}>カンマ区切りで複数指定できます。</div>
            </div>
          );
        }

        if (isRelation(field)) {
          return (
            <div key={field.key}>
              <div className="label">{field.name}</div>
              <input
                className="input"
                placeholder="NotionページURLまたはIDをカンマ区切りで入力"
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
              {field.display && (
                <div className="muted" style={{ marginTop: 6 }}>現在: {field.display}</div>
              )}
            </div>
          );
        }

        if (field.type === "rich_text") {
          return (
            <div key={field.key}>
              <div className="label">{field.name}</div>
              <textarea
                className="input"
                rows={4}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
            </div>
          );
        }

        return (
          <div key={field.key}>
            <div className="label">{field.name}</div>
            <input
              className="input"
              type={getInputType(field)}
              value={typeof value === "string" || typeof value === "number" ? value : ""}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          </div>
        );
      })}

      {error && <div style={{ color: "#a02222" }}>{error}</div>}
    </form>
  );
}
