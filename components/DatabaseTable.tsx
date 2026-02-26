import Link from "next/link";
import type { DatabaseTable } from "@/lib/notion";

type Props = {
  table: DatabaseTable;
  emptyMessage?: string;
  titleLinkBasePath?: string;
  rowEditHrefBasePath?: string;
  createHref?: string;
  databaseId?: string;
};

const notionPageUrl = (id: string): string => `https://www.notion.so/${id.replace(/-/g, "")}`;
const notionDatabaseUrl = (id: string): string => `https://www.notion.so/${id.replace(/-/g, "")}`;

export default function DatabaseTable({
  table,
  emptyMessage = "データがありません。",
  titleLinkBasePath,
  rowEditHrefBasePath,
  createHref,
  databaseId
}: Props) {
  if (table.rows.length === 0) {
    return (
      <div className="card">
        <p className="muted">{emptyMessage}</p>
      </div>
    );
  }

  const resolvedCreateHref = createHref ?? (databaseId ? notionDatabaseUrl(databaseId) : null);
  const createIsExternal = Boolean(resolvedCreateHref?.startsWith("http"));

  return (
    <div className="card table-wrap">
      <div className="table-toolbar">
        <div className="muted">{table.rows.length}件 / {table.columns.length}カラム</div>
        {resolvedCreateHref && (
          <Link
            href={resolvedCreateHref}
            className="button-link"
            target={createIsExternal ? "_blank" : undefined}
            rel={createIsExternal ? "noreferrer noopener" : undefined}
          >
            新規作成
          </Link>
        )}
      </div>
      <div className="record-grid">
        {table.rows.map((row) => {
          const titleColumn = table.columns.find((column) => column.isTitle) ?? table.columns[0];
          const editHref = rowEditHrefBasePath ? `${rowEditHrefBasePath}/${row.id}` : notionPageUrl(row.id);
          const editIsExternal = !rowEditHrefBasePath;
          const titleText = row.cells[titleColumn?.key] ?? "-";

          return (
            <article key={row.id} className="record-card">
              <div className="record-head">
                <h2 className="record-title">
                  {titleLinkBasePath && titleColumn ? (
                    <Link href={`${titleLinkBasePath}/${row.id}`}>{titleText}</Link>
                  ) : (
                    titleText
                  )}
                </h2>
                <Link
                  href={editHref}
                  className="row-action"
                  target={editIsExternal ? "_blank" : undefined}
                  rel={editIsExternal ? "noreferrer noopener" : undefined}
                >
                  編集
                </Link>
              </div>
              <div className="record-fields">
                {table.columns
                  .filter((column) => column.key !== titleColumn?.key)
                  .map((column) => (
                    <section key={column.key} className="record-field">
                      <div className="record-label">{column.name}</div>
                      <div className="record-value">{row.cells[column.key] ?? "-"}</div>
                    </section>
                  ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
