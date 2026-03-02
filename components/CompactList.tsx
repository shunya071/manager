"use client";

import Link from "next/link";
import type { DatabaseTable, DatabaseTableColumn } from "@/lib/notion";

type Props = {
  table: DatabaseTable;
  emptyMessage?: string;
  titleLinkBasePath?: string;
  rowEditHrefBasePath?: string;
  createHref?: string;
  visibleKeys?: string[];
  maxColumns?: number;
};

const resolveColumns = (
  columns: DatabaseTableColumn[],
  visibleKeys?: string[],
  maxColumns = 6
) => {
  const titleColumn = columns.find((column) => column.isTitle) ?? columns[0];
  if (!titleColumn) return [];
  if (Array.isArray(visibleKeys) && visibleKeys.length > 0) {
    const set = new Set([titleColumn.key, ...visibleKeys]);
    return columns.filter((column) => set.has(column.key));
  }
  const others = columns.filter((column) => column.key !== titleColumn.key);
  return [titleColumn, ...others.slice(0, Math.max(0, maxColumns - 1))];
};

const gridTemplateFor = (count: number) => {
  if (count <= 1) return "1fr";
  return `1.6fr ${"1fr ".repeat(count - 1).trim()}`;
};

export default function CompactList({
  table,
  emptyMessage = "データがありません。",
  titleLinkBasePath,
  rowEditHrefBasePath,
  createHref,
  visibleKeys,
  maxColumns = 6
}: Props) {
  if (table.rows.length === 0) {
    return (
      <div className="card">
        <p className="muted">{emptyMessage}</p>
      </div>
    );
  }

  const columns = resolveColumns(table.columns, visibleKeys, maxColumns);
  if (columns.length === 0) {
    return (
      <div className="card">
        <p className="muted">{emptyMessage}</p>
      </div>
    );
  }
  const titleColumn = columns.find((column) => column.isTitle) ?? columns[0];
  const gridTemplateColumns = gridTemplateFor(columns.length);

  return (
    <div className="grid">
      <div className="card table-toolbar">
        <div className="muted">{table.rows.length}件</div>
        {createHref && (
          <Link href={createHref} className="button-link">
            新規作成
          </Link>
        )}
      </div>

      <div className="card task-list">
        <div className="task-row task-row-head" style={{ gridTemplateColumns }}>
          {columns.map((column) => (
            <div key={column.key}>{column.name}</div>
          ))}
        </div>
        {table.rows.map((row) => {
          const editHref = rowEditHrefBasePath ? `${rowEditHrefBasePath}/${row.id}` : null;
          const titleText = row.cells[titleColumn.key] ?? "-";
          return (
            <div key={row.id} className="task-row" style={{ gridTemplateColumns }}>
              {columns.map((column) => {
                const value = row.cells[column.key] ?? "-";
                if (column.key === titleColumn.key && editHref) {
                  return (
                    <div key={column.key} data-label={column.name}>
                      <Link className="task-link" href={editHref}>
                        {titleText}
                      </Link>
                    </div>
                  );
                }
                return (
                  <div key={column.key} data-label={column.name}>
                    {value}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
