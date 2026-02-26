const normalize = (value: string): string => {
  const trimmed = value.trim();
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

const required = (key: string): string => {
  const raw = process.env[key];
  if (!raw) {
    throw new Error(`Missing env: ${key}`);
  }
  return normalize(raw);
};

export const env = {
  notionApiKey: required("NOTION_API_KEY"),
  dbLeads: required("NOTION_DATABASE_ID_LEADS"),
  dbClients: required("NOTION_DATABASE_ID_CLIENTS"),
  dbTasks: required("NOTION_DATABASE_ID_TASKS"),
  dbTaskTemplates: required("NOTION_DATABASE_ID_TASK_TEMPLATES"),
  dbProjects: process.env.NOTION_DATABASE_ID_PROJECTS,
  dbWorkLogs: process.env.NOTION_DATABASE_ID_WORKLOGS,
  dbInvoices: process.env.NOTION_DATABASE_ID_INVOICES,
  dbTransactions: process.env.NOTION_DATABASE_ID_TRANSACTIONS
};
