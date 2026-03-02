import { Client } from "@notionhq/client";
import { env } from "./env";

export type Lead = {
  id: string;
  name: string;
  status: string | null;
  priority: string | null;
  channel: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  autoTasksCreated: boolean;
  clientId: string | null;
};

export type ClientRecord = {
  id: string;
  name: string;
  status: string | null;
  defaultRate: number | null;
};

export type Task = {
  id: string;
  name: string;
  status: string | null;
  type: string | null;
  priority: string | null;
  dueDate: string | null;
  estimateMinutes: number | null;
  billable: boolean;
  clientId: string | null;
  leadId: string | null;
  parentTaskId: string | null;
};

export type TaskTemplate = {
  id: string;
  name: string;
  templateGroup: string | null;
  defaultType: string | null;
  defaultPriority: string | null;
  defaultEstimateMinutes: number | null;
  offsetDays: number | null;
  isParent: boolean;
  parentTemplateId: string | null;
};

const notion = new Client({ auth: env.notionApiKey });

const joinPlainText = (items: Array<{ plain_text?: string }> | undefined): string => {
  if (!items || items.length === 0) return "";
  return items.map((item) => item.plain_text ?? "").join("").trim();
};

const getTitle = (prop: any): string => {
  return joinPlainText(prop?.title);
};

const getRichText = (prop: any): string | null => {
  const text = joinPlainText(prop?.rich_text);
  return text || null;
};

const getSelect = (prop: any): string | null => {
  return prop?.select?.name ?? null;
};

const getDate = (prop: any): string | null => {
  return prop?.date?.start ?? null;
};

const getNumber = (prop: any): number | null => {
  return typeof prop?.number === "number" ? prop.number : null;
};

const getCheckbox = (prop: any): boolean => {
  return Boolean(prop?.checkbox);
};

const getRelationId = (prop: any): string | null => {
  const id = prop?.relation?.[0]?.id;
  return id ?? null;
};

const getRelationIds = (prop: any): string[] => {
  return Array.isArray(prop?.relation) ? prop.relation.map((rel: any) => rel.id) : [];
};

const toDateOnly = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const selectProp = (value: string | null | undefined) => {
  if (!value) return undefined;
  return { select: { name: value } };
};

export async function getLeads(): Promise<Lead[]> {
  const response = await notion.databases.query({
    database_id: env.dbLeads
  });

  return response.results.map((page: any) => ({
    id: page.id,
    name: getTitle(page.properties.Name),
    status: getSelect(page.properties.Status),
    priority: getSelect(page.properties.Priority),
    channel: getSelect(page.properties.Channel),
    nextAction: getRichText(page.properties["Next Action"]),
    nextActionDate: getDate(page.properties["Next Action Date"]),
    autoTasksCreated: getCheckbox(page.properties["Auto Tasks Created"]),
    clientId: getRelationId(page.properties.Client)
  }));
}

export async function createLead(input: {
  name: string;
  status?: string | null;
  priority?: string | null;
  channel?: string | null;
  nextAction?: string | null;
  nextActionDate?: string | null;
  clientId?: string | null;
}): Promise<Lead> {
  const payload: any = {
    Name: { title: [{ text: { content: input.name } }] },
    Status: selectProp(input.status),
    Priority: selectProp(input.priority),
    Channel: selectProp(input.channel),
    "Next Action": input.nextAction ? { rich_text: [{ text: { content: input.nextAction } }] } : undefined,
    "Next Action Date": input.nextActionDate ? { date: { start: input.nextActionDate } } : undefined,
    Client: input.clientId ? { relation: [{ id: input.clientId }] } : undefined,
    "Auto Tasks Created": { checkbox: false }
  };

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

  const response = await notion.pages.create({
    parent: { database_id: env.dbLeads },
    properties: payload
  });

  return {
    id: response.id,
    name: input.name,
    status: input.status ?? null,
    priority: input.priority ?? null,
    channel: input.channel ?? null,
    nextAction: input.nextAction ?? null,
    nextActionDate: input.nextActionDate ?? null,
    autoTasksCreated: false,
    clientId: input.clientId ?? null
  };
}

export async function updateLead(
  id: string,
  data: { status?: string | null; priority?: string | null; autoTasksCreated?: boolean }
): Promise<void> {
  const properties: any = {};
  if (data.status !== undefined) {
    properties.Status = data.status ? { select: { name: data.status } } : { select: null };
  }
  if (data.priority !== undefined) {
    properties.Priority = data.priority ? { select: { name: data.priority } } : { select: null };
  }
  if (data.autoTasksCreated !== undefined) {
    properties["Auto Tasks Created"] = { checkbox: data.autoTasksCreated };
  }
  await notion.pages.update({ page_id: id, properties });
}

export async function getClients(): Promise<ClientRecord[]> {
  const response = await notion.databases.query({
    database_id: env.dbClients
  });

  return response.results.map((page: any) => ({
    id: page.id,
    name: getTitle(page.properties.Name),
    status: getSelect(page.properties.Status),
    defaultRate: getNumber(page.properties["Default Rate (JPY/h)"])
  }));
}

export async function getClientById(clientId: string): Promise<ClientRecord | null> {
  const page: any = await notion.pages.retrieve({ page_id: clientId });
  if (!page?.properties?.Name) return null;
  return {
    id: page.id,
    name: getTitle(page.properties.Name),
    status: getSelect(page.properties.Status),
    defaultRate: getNumber(page.properties["Default Rate (JPY/h)"])
  };
}

export async function getClientTasks(clientId: string): Promise<Task[]> {
  const response = await notion.databases.query({
    database_id: env.dbTasks,
    filter: {
      property: "Client",
      relation: { contains: clientId }
    }
  });

  return response.results.map((page: any) => ({
    id: page.id,
    name: getTitle(page.properties.Name),
    status: getSelect(page.properties.Status),
    type: getSelect(page.properties.Type),
    priority: getSelect(page.properties.Priority),
    dueDate: getDate(page.properties["Due Date"]),
    estimateMinutes: getNumber(page.properties["Estimate Minutes"]),
    billable: getCheckbox(page.properties.Billable),
    clientId: getRelationId(page.properties.Client),
    leadId: getRelationId(page.properties.Lead),
    parentTaskId: getRelationId(page.properties["Parent Task"])
  }));
}

export async function createTask(input: {
  name: string;
  clientId?: string | null;
  leadId?: string | null;
  status?: string | null;
  type?: string | null;
  priority?: string | null;
  dueDate?: string | null;
  estimateMinutes?: number | null;
  billable?: boolean;
  parentTaskId?: string | null;
}): Promise<string> {
  const properties: any = {
    Name: { title: [{ text: { content: input.name } }] },
    Client: input.clientId ? { relation: [{ id: input.clientId }] } : undefined,
    Lead: input.leadId ? { relation: [{ id: input.leadId }] } : undefined,
    Status: selectProp(input.status),
    Type: selectProp(input.type),
    Priority: selectProp(input.priority),
    "Due Date": input.dueDate ? { date: { start: input.dueDate } } : undefined,
    "Estimate Minutes": typeof input.estimateMinutes === "number" ? { number: input.estimateMinutes } : undefined,
    Billable: { checkbox: Boolean(input.billable) },
    "Parent Task": input.parentTaskId ? { relation: [{ id: input.parentTaskId }] } : undefined
  };

  Object.keys(properties).forEach((key) => properties[key] === undefined && delete properties[key]);

  const response = await notion.pages.create({ parent: { database_id: env.dbTasks }, properties });
  return response.id;
}

export async function updateTask(id: string, data: { status?: string | null; dueDate?: string | null }): Promise<void> {
  const properties: any = {};
  if (data.status !== undefined) {
    properties.Status = data.status ? { select: { name: data.status } } : { select: null };
  }
  if (data.dueDate !== undefined) {
    properties["Due Date"] = data.dueDate ? { date: { start: data.dueDate } } : { date: null };
  }
  await notion.pages.update({ page_id: id, properties });
}

export async function getTaskTemplatesByGroup(group: string): Promise<TaskTemplate[]> {
  const response = await notion.databases.query({
    database_id: env.dbTaskTemplates,
    filter: {
      property: "Template Group",
      select: { equals: group }
    }
  });

  return response.results.map((page: any) => ({
    id: page.id,
    name: getTitle(page.properties.Name),
    templateGroup: getSelect(page.properties["Template Group"]),
    defaultType: getSelect(page.properties["Default Type"]),
    defaultPriority: getSelect(page.properties["Default Priority"]),
    defaultEstimateMinutes: getNumber(page.properties["Default Estimate Minutes"]),
    offsetDays: getNumber(page.properties["Offset Days"]),
    isParent: getCheckbox(page.properties["Is Parent"]),
    parentTemplateId: getRelationId(page.properties["Parent Template"])
  }));
}

export async function generateTasksFromTemplates(input: {
  leadId: string;
  clientId?: string | null;
  createdAt: Date;
  templates: TaskTemplate[];
}): Promise<void> {
  const templateMap = new Map<string, TaskTemplate>();
  input.templates.forEach((template) => templateMap.set(template.id, template));

  const taskMap = new Map<string, string>();
  const parents = input.templates.filter((template) => !template.parentTemplateId);
  const children = input.templates.filter((template) => template.parentTemplateId);

  for (const template of parents) {
    const due = template.offsetDays ? toDateOnly(addDays(input.createdAt, template.offsetDays)) : null;
    const taskId = await createTask({
      name: template.name,
      clientId: input.clientId,
      leadId: input.leadId,
      status: "未着手",
      type: template.defaultType,
      priority: template.defaultPriority,
      dueDate: due,
      estimateMinutes: template.defaultEstimateMinutes,
      billable: true,
      parentTaskId: null
    });
    taskMap.set(template.id, taskId);
  }

  for (const template of children) {
    const parentTaskId = template.parentTemplateId ? taskMap.get(template.parentTemplateId) : null;
    const due = template.offsetDays ? toDateOnly(addDays(input.createdAt, template.offsetDays)) : null;
    const taskId = await createTask({
      name: template.name,
      clientId: input.clientId,
      leadId: input.leadId,
      status: "未着手",
      type: template.defaultType,
      priority: template.defaultPriority,
      dueDate: due,
      estimateMinutes: template.defaultEstimateMinutes,
      billable: true,
      parentTaskId: parentTaskId ?? null
    });
    taskMap.set(template.id, taskId);
  }
}

export type DatabaseTableColumn = {
  key: string;
  name: string;
  type: string;
  isTitle: boolean;
};

export type DatabaseTableRow = {
  id: string;
  cells: Record<string, string>;
};

export type DatabaseTable = {
  title: string;
  columns: DatabaseTableColumn[];
  rows: DatabaseTableRow[];
};

export type DatabaseSelectOptions = Record<string, string[]>;

export type DatabaseRecordField = {
  key: string;
  name: string;
  type: string;
  value: string | number | boolean;
  editable: boolean;
  options?: string[];
  display?: string;
};

export type DatabaseRecord = {
  title: string;
  fields: DatabaseRecordField[];
};

type RelationTitleMap = Record<string, string>;

const relationTitleCache = new Map<string, { title: string; ts: number }>();
const RELATION_TITLE_TTL_MS = 10 * 60 * 1000;

export type TaskListItem = {
  id: string;
  title: string;
  priority: string;
  type: string;
  dueDate: string;
  status: string;
  client: string;
  note: string;
};

const getPlainText = (items: Array<{ plain_text?: string }> | undefined): string => {
  const text = joinPlainText(items);
  return text || "-";
};

const formatDateRange = (date: { start?: string | null; end?: string | null } | null): string => {
  if (!date?.start) return "-";
  return date.end ? `${date.start} → ${date.end}` : date.start;
};

const formatFormula = (formula: any): string => {
  if (!formula || !formula.type) return "-";
  switch (formula.type) {
    case "string":
      return formula.string ?? "-";
    case "number":
      return typeof formula.number === "number" ? String(formula.number) : "-";
    case "boolean":
      return formula.boolean ? "Yes" : "No";
    case "date":
      return formatDateRange(formula.date ?? null);
    default:
      return "-";
  }
};

const formatRollup = (rollup: any, relationTitles?: RelationTitleMap): string => {
  if (!rollup || !rollup.type) return "-";
  switch (rollup.type) {
    case "number":
      return typeof rollup.number === "number" ? String(rollup.number) : "-";
    case "date":
      return formatDateRange(rollup.date ?? null);
    case "array":
      if (!Array.isArray(rollup.array) || rollup.array.length === 0) return "-";
      return rollup.array
        .map((item: any) => {
          if (!item || !item.type) return "-";
          switch (item.type) {
            case "title":
              return getPlainText(item.title);
            case "rich_text":
              return getPlainText(item.rich_text);
            case "number":
              return typeof item.number === "number" ? String(item.number) : "-";
            case "date":
              return formatDateRange(item.date ?? null);
            case "select":
              return item.select?.name ?? "-";
            case "status":
              return item.status?.name ?? "-";
            case "people":
              return Array.isArray(item.people) && item.people.length > 0
                ? item.people.map((person: any) => person.name ?? "Unknown").join(", ")
                : "-";
            case "relation":
              if (!Array.isArray(item.relation) || item.relation.length === 0) return "-";
              return item.relation
                .map((rel: any) => relationTitles?.[rel.id] ?? rel.id)
                .filter(Boolean)
                .join(", ");
            default:
              return "-";
          }
        })
        .filter((value: string) => value !== "-")
        .join(", ") || "-";
    default:
      return "-";
  }
};

const formatPropertyValue = (prop: any, relationTitles?: RelationTitleMap): string => {
  if (!prop?.type) return "-";
  switch (prop.type) {
    case "title":
      return getPlainText(prop.title);
    case "rich_text":
      return getPlainText(prop.rich_text);
    case "select":
      return prop.select?.name ?? "-";
    case "status":
      return prop.status?.name ?? "-";
    case "multi_select":
      return Array.isArray(prop.multi_select) && prop.multi_select.length > 0
        ? prop.multi_select.map((item: any) => item.name).join(", ")
        : "-";
    case "number":
      return typeof prop.number === "number" ? String(prop.number) : "-";
    case "date":
      return formatDateRange(prop.date ?? null);
    case "checkbox":
      return prop.checkbox ? "Yes" : "No";
    case "relation":
      return Array.isArray(prop.relation) && prop.relation.length > 0
        ? prop.relation.map((relation: any) => relationTitles?.[relation.id] ?? relation.id).join(", ")
        : "-";
    case "people":
      return Array.isArray(prop.people) && prop.people.length > 0
        ? prop.people.map((person: any) => person.name ?? "Unknown").join(", ")
        : "-";
    case "email":
      return prop.email ?? "-";
    case "phone_number":
      return prop.phone_number ?? "-";
    case "url":
      return prop.url ?? "-";
    case "files":
      return Array.isArray(prop.files) && prop.files.length > 0
        ? prop.files.map((file: any) => file.name ?? "file").join(", ")
        : "-";
    case "formula":
      return formatFormula(prop.formula);
    case "rollup":
      return formatRollup(prop.rollup, relationTitles);
    case "created_time":
      return prop.created_time ?? "-";
    case "last_edited_time":
      return prop.last_edited_time ?? "-";
    case "created_by":
      return prop.created_by?.name ?? "-";
    case "last_edited_by":
      return prop.last_edited_by?.name ?? "-";
    default:
      return "-";
  }
};

const getEditableValue = (prop: any, type: string, relationTitles?: RelationTitleMap): string | number | boolean => {
  switch (type) {
    case "title":
      return getPlainText(prop?.title);
    case "rich_text":
      return getPlainText(prop?.rich_text);
    case "number":
      return typeof prop?.number === "number" ? prop.number : "";
    case "select":
      return prop?.select?.name ?? "";
    case "status":
      return prop?.status?.name ?? "";
    case "multi_select":
      return Array.isArray(prop?.multi_select) && prop.multi_select.length > 0
        ? prop.multi_select.map((item: any) => item.name).join(", ")
        : "";
    case "date":
      return prop?.date?.start ?? "";
    case "checkbox":
      return Boolean(prop?.checkbox);
    case "email":
      return prop?.email ?? "";
    case "phone_number":
      return prop?.phone_number ?? "";
    case "url":
      return prop?.url ?? "";
    case "relation":
      return Array.isArray(prop?.relation) && prop.relation.length > 0
        ? prop.relation.map((rel: any) => rel.id).join(", ")
        : "";
    default:
      return formatPropertyValue(prop ?? null, relationTitles);
  }
};

const isEditableType = (type: string): boolean => {
  return [
    "title",
    "rich_text",
    "number",
    "select",
    "status",
    "multi_select",
    "date",
    "checkbox",
    "email",
    "phone_number",
    "url",
    "relation"
  ].includes(type);
};

export async function getDatabaseTable(databaseId: string, options?: { limit?: number }): Promise<DatabaseTable> {
  const limit = typeof options?.limit === "number" && options.limit > 0
    ? options.limit
    : Number.POSITIVE_INFINITY;
  const database: any = await notion.databases.retrieve({ database_id: databaseId });
  const columns = Object.entries(database.properties).map(([key, value]: [string, any]) => ({
    key,
    name: value?.name ?? key,
    type: value?.type ?? "unknown",
    isTitle: value?.type === "title"
  }));

  const orderedColumns = [
    ...columns.filter((column) => column.isTitle),
    ...columns.filter((column) => !column.isTitle)
  ];

  const rows: DatabaseTableRow[] = [];
  const pages: any[] = [];
  let cursor: string | undefined = undefined;
  let remaining = limit;

  while (remaining > 0) {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: Math.min(100, Number.isFinite(remaining) ? remaining : 100),
      start_cursor: cursor
    });
    response.results.forEach((page: any) => {
      pages.push(page);
    });
    if (Number.isFinite(remaining)) {
      remaining -= response.results.length;
    }
    if (!response.has_more || !response.next_cursor) {
      break;
    }
    cursor = response.next_cursor ?? undefined;
  }

  const relationTitles = await resolveRelationTitleMap(pages, orderedColumns);
  pages.forEach((page: any) => {
    const cells: Record<string, string> = {};
    orderedColumns.forEach((column) => {
      cells[column.key] = formatPropertyValue(page.properties?.[column.key], relationTitles);
    });
    rows.push({ id: page.id, cells });
  });

  const dbTitle = getPlainText(database.title);
  return { title: dbTitle === "-" ? "" : dbTitle, columns: orderedColumns, rows };
}

const extractSelectOptions = (prop: any): string[] => {
  if (!prop?.type) return [];
  switch (prop.type) {
    case "select":
      return Array.isArray(prop.select?.options) ? prop.select.options.map((opt: any) => opt?.name).filter(Boolean) : [];
    case "status":
      return Array.isArray(prop.status?.options) ? prop.status.options.map((opt: any) => opt?.name).filter(Boolean) : [];
    case "multi_select":
      return Array.isArray(prop.multi_select?.options)
        ? prop.multi_select.options.map((opt: any) => opt?.name).filter(Boolean)
        : [];
    default:
      return [];
  }
};

const extractPageTitle = (page: any): string => {
  if (!page?.properties) return "";
  const titleProp = (Object.values(page.properties) as any[]).find((prop: any) => prop?.type === "title");
  return titleProp ? getPlainText(titleProp.title) : "";
};

const normalizeNotionId = (raw: string): string | null => {
  const cleaned = raw.trim();
  if (!cleaned) return null;
  const match = cleaned.match(/[0-9a-fA-F]{32}/);
  const id = match ? match[0].toLowerCase() : cleaned.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(id)) return null;
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
};

const normalizeRelationIds = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).flatMap((item) => normalizeRelationIds(item));
  }
  const text = typeof value === "string" ? value : String(value ?? "");
  const tokens = text.split(/[, \n]+/).map((token) => token.trim()).filter(Boolean);
  const ids = tokens
    .map((token) => normalizeNotionId(token))
    .filter((id): id is string => Boolean(id));
  return Array.from(new Set(ids));
};

const getPropValueByNames = (props: Record<string, any>, names: string[], relationTitles?: RelationTitleMap): string => {
  for (const name of names) {
    if (props?.[name]) {
      return formatPropertyValue(props[name], relationTitles);
    }
  }
  return "-";
};

const resolveRelationTitleMap = async (
  pages: any[],
  columns: Array<{ key: string; type: string }>
): Promise<RelationTitleMap> => {
  const relationKeys = columns.filter((column) => column.type === "relation").map((column) => column.key);
  if (relationKeys.length === 0) return {};
  const ids = new Set<string>();
  pages.forEach((page) => {
    relationKeys.forEach((key) => {
      const rels = page?.properties?.[key]?.relation;
      if (Array.isArray(rels)) {
        rels.forEach((rel: any) => {
          if (rel?.id) ids.add(rel.id);
        });
      }
    });
  });
  if (ids.size === 0) return {};
  const idList = Array.from(ids);
  const results: Array<{ id: string; title: string }> = [];
  const missing = idList.filter((id) => {
    const cached = relationTitleCache.get(id);
    return !cached || Date.now() - cached.ts > RELATION_TITLE_TTL_MS;
  });

  const fetchBatch = async (batch: string[]) => {
    const batchResults = await Promise.all(
      batch.map(async (id) => {
        try {
          const page = await notion.pages.retrieve({ page_id: id });
          return { id, title: extractPageTitle(page) || id };
        } catch {
          return { id, title: id };
        }
      })
    );
    batchResults.forEach((item) => {
      relationTitleCache.set(item.id, { title: item.title, ts: Date.now() });
    });
  };

  const batchSize = 20;
  for (let i = 0; i < missing.length; i += batchSize) {
    const batch = missing.slice(i, i + batchSize);
    await fetchBatch(batch);
  }

  idList.forEach((id) => {
    const cached = relationTitleCache.get(id);
    results.push({ id, title: cached?.title ?? id });
  });
  const map: RelationTitleMap = {};
  results.forEach((item) => {
    map[item.id] = item.title;
  });
  return map;
};

export async function getDatabaseSelectOptions(
  databaseId: string,
  propertyNames: string[]
): Promise<DatabaseSelectOptions> {
  const database: any = await notion.databases.retrieve({ database_id: databaseId });
  const options: DatabaseSelectOptions = {};
  propertyNames.forEach((name) => {
    const prop = database?.properties?.[name];
    options[name] = extractSelectOptions(prop);
  });
  return options;
}

export async function getDatabaseRecord(databaseId: string, pageId: string): Promise<DatabaseRecord | null> {
  const [database, page]: any = await Promise.all([
    notion.databases.retrieve({ database_id: databaseId }),
    notion.pages.retrieve({ page_id: pageId })
  ]);
  if (!database?.properties || !page?.properties) return null;

  const columns = Object.entries(database.properties).map(([key, value]: [string, any]) => ({
    key,
    name: value?.name ?? key,
    type: value?.type ?? "unknown",
    isTitle: value?.type === "title",
    options: extractSelectOptions(value)
  }));

  const orderedColumns = [
    ...columns.filter((column) => column.isTitle),
    ...columns.filter((column) => !column.isTitle)
  ];

  const relationTitles = await resolveRelationTitleMap([page], orderedColumns);
  const fields: DatabaseRecordField[] = orderedColumns.map((column) => {
    const propValue = page.properties?.[column.key];
    const editable = isEditableType(column.type);
    return {
      key: column.key,
      name: column.name,
      type: column.type,
      value: getEditableValue(propValue, column.type, relationTitles),
      editable,
      options: column.options,
      display: column.type === "relation" ? formatPropertyValue(propValue, relationTitles) : undefined
    };
  });

  const titleField = fields.find((field) => field.type === "title");
  const title = typeof titleField?.value === "string" ? titleField.value : "";
  return { title, fields };
}

const buildPropertyPayload = (type: string, value: any) => {
  switch (type) {
    case "title": {
      const text = typeof value === "string" ? value.trim() : "";
      return { title: text ? [{ text: { content: text } }] : [] };
    }
    case "rich_text": {
      const text = typeof value === "string" ? value.trim() : "";
      return { rich_text: text ? [{ text: { content: text } }] : [] };
    }
    case "number": {
      if (value === "" || value === null || value === undefined) return { number: null };
      const parsed = Number(value);
      if (Number.isNaN(parsed)) return null;
      return { number: parsed };
    }
    case "select": {
      const name = typeof value === "string" ? value.trim() : "";
      return { select: name ? { name } : null };
    }
    case "status": {
      const name = typeof value === "string" ? value.trim() : "";
      return { status: name ? { name } : null };
    }
    case "multi_select": {
      if (Array.isArray(value)) {
        const names = value.map((item) => String(item).trim()).filter(Boolean);
        return { multi_select: names.map((name) => ({ name })) };
      }
      const text = typeof value === "string" ? value : "";
      const names = text.split(",").map((item) => item.trim()).filter(Boolean);
      return { multi_select: names.map((name) => ({ name })) };
    }
    case "relation": {
      const ids = normalizeRelationIds(value);
      return { relation: ids.map((id) => ({ id })) };
    }
    case "date": {
      const date = typeof value === "string" ? value.trim() : "";
      return { date: date ? { start: date } : null };
    }
    case "checkbox":
      return { checkbox: Boolean(value) };
    case "email": {
      const email = typeof value === "string" ? value.trim() : "";
      return { email: email || null };
    }
    case "phone_number": {
      const phone = typeof value === "string" ? value.trim() : "";
      return { phone_number: phone || null };
    }
    case "url": {
      const url = typeof value === "string" ? value.trim() : "";
      return { url: url || null };
    }
    default:
      return null;
  }
};

export async function updateDatabaseRecord(
  databaseId: string,
  pageId: string,
  updates: Record<string, any>
): Promise<void> {
  const database: any = await notion.databases.retrieve({ database_id: databaseId });
  if (!database?.properties) return;
  const properties: any = {};
  Object.entries(updates).forEach(([key, value]) => {
    const prop = database.properties[key];
    if (!prop?.type || !isEditableType(prop.type)) return;
    const payload = buildPropertyPayload(prop.type, value);
    if (!payload) return;
    properties[key] = payload;
  });
  await notion.pages.update({ page_id: pageId, properties });
}

const getEmptyValueForType = (type: string): string | number | boolean => {
  switch (type) {
    case "number":
      return "";
    case "checkbox":
      return false;
    case "date":
    case "email":
    case "phone_number":
    case "url":
    case "select":
    case "status":
    case "multi_select":
    case "relation":
    case "rich_text":
    case "title":
    default:
      return "";
  }
};

export async function getDatabaseDraft(databaseId: string): Promise<DatabaseRecord> {
  const database: any = await notion.databases.retrieve({ database_id: databaseId });
  const columns = Object.entries(database.properties).map(([key, value]: [string, any]) => ({
    key,
    name: value?.name ?? key,
    type: value?.type ?? "unknown",
    isTitle: value?.type === "title",
    options: extractSelectOptions(value)
  }));

  const orderedColumns = [
    ...columns.filter((column) => column.isTitle),
    ...columns.filter((column) => !column.isTitle)
  ];

  const fields: DatabaseRecordField[] = orderedColumns.map((column) => ({
    key: column.key,
    name: column.name,
    type: column.type,
    value: getEmptyValueForType(column.type),
    editable: isEditableType(column.type),
    options: column.options
  }));

  return { title: "", fields };
}

export async function createDatabaseRecord(
  databaseId: string,
  updates: Record<string, any>
): Promise<string> {
  const database: any = await notion.databases.retrieve({ database_id: databaseId });
  if (!database?.properties) {
    throw new Error("Database not found");
  }
  const properties: any = {};
  Object.entries(updates).forEach(([key, value]) => {
    const prop = database.properties[key];
    if (!prop?.type || !isEditableType(prop.type)) return;
    const payload = buildPropertyPayload(prop.type, value);
    if (!payload) return;
    properties[key] = payload;
  });
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties
  });
  return response.id;
}

export async function getTasksList(databaseId: string): Promise<TaskListItem[]> {
  const pages: any[] = [];
  let cursor: string | undefined = undefined;
  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: cursor
    });
    pages.push(...(response.results as any[]));
    if (!response.has_more || !response.next_cursor) break;
    cursor = response.next_cursor ?? undefined;
  }
  const columns = [
    { key: "Client", type: "relation" }
  ];
  const relationTitles = await resolveRelationTitleMap(pages, columns);
  return pages.map((page) => {
    const props = page.properties ?? {};
    return {
      id: page.id,
      title: getPropValueByNames(props, ["Name", "タイトル", "Title"], relationTitles),
      priority: getPropValueByNames(props, ["Priority", "優先度"], relationTitles),
      type: getPropValueByNames(props, ["Type", "タイプ"], relationTitles),
      dueDate: getPropValueByNames(props, ["Due Date", "期限", "期日"], relationTitles),
      status: getPropValueByNames(props, ["Status", "ステータス"], relationTitles),
      client: getPropValueByNames(props, ["Client", "クライアント"], relationTitles),
      note: getPropValueByNames(props, ["Note", "Notes", "ノート", "メモ"], relationTitles)
    };
  });
}
