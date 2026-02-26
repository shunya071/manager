import { Client } from "@notionhq/client";
import {
  CLIENT_STATUS_OPTIONS,
  LEAD_CHANNEL_OPTIONS,
  LEAD_PRIORITY_OPTIONS,
  LEAD_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  TASK_TYPE_OPTIONS
} from "./constants";
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

const pickOption = (value: string | null | undefined, options: readonly string[]): string | null => {
  if (!value) return null;
  return options.includes(value) ? value : null;
};

const selectProp = (value: string | null | undefined, options: readonly string[]) => {
  const picked = pickOption(value, options);
  return picked ? { select: { name: picked } } : undefined;
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
    Status: selectProp(input.status, LEAD_STATUS_OPTIONS),
    Priority: selectProp(input.priority, LEAD_PRIORITY_OPTIONS),
    Channel: selectProp(input.channel, LEAD_CHANNEL_OPTIONS),
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
    const picked = pickOption(data.status, LEAD_STATUS_OPTIONS);
    properties.Status = picked ? { select: { name: picked } } : { select: null };
  }
  if (data.priority !== undefined) {
    const picked = pickOption(data.priority, LEAD_PRIORITY_OPTIONS);
    properties.Priority = picked ? { select: { name: picked } } : { select: null };
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
    Status: selectProp(input.status, TASK_STATUS_OPTIONS),
    Type: selectProp(input.type, TASK_TYPE_OPTIONS),
    Priority: selectProp(input.priority, TASK_PRIORITY_OPTIONS),
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
    const picked = pickOption(data.status, TASK_STATUS_OPTIONS);
    properties.Status = picked ? { select: { name: picked } } : { select: null };
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

const formatRollup = (rollup: any): string => {
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
              return item.relation?.id ?? "-";
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

const formatPropertyValue = (prop: any): string => {
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
        ? prop.relation.map((relation: any) => relation.id).join(", ")
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
      return formatRollup(prop.rollup);
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
  let cursor: string | undefined = undefined;
  let remaining = limit;

  while (remaining > 0) {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: Math.min(100, Number.isFinite(remaining) ? remaining : 100),
      start_cursor: cursor
    });
    response.results.forEach((page: any) => {
      const cells: Record<string, string> = {};
      orderedColumns.forEach((column) => {
        cells[column.key] = formatPropertyValue(page.properties?.[column.key]);
      });
      rows.push({ id: page.id, cells });
    });
    if (Number.isFinite(remaining)) {
      remaining -= response.results.length;
    }
    if (!response.has_more || !response.next_cursor) {
      break;
    }
    cursor = response.next_cursor ?? undefined;
  }

  const dbTitle = getPlainText(database.title);
  return { title: dbTitle === "-" ? "" : dbTitle, columns: orderedColumns, rows };
}
