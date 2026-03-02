"use client";

import { useEffect, useState } from "react";
import {
  LEAD_CHANNEL_OPTIONS,
  LEAD_PRIORITY_OPTIONS,
  LEAD_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  TASK_TYPE_OPTIONS
} from "@/lib/constants";

type NotionOptions = {
  leads: {
    status: string[];
    priority: string[];
    channel: string[];
  };
  tasks: {
    status: string[];
    type: string[];
    priority: string[];
  };
};

const defaults: NotionOptions = {
  leads: {
    status: [...LEAD_STATUS_OPTIONS],
    priority: [...LEAD_PRIORITY_OPTIONS],
    channel: [...LEAD_CHANNEL_OPTIONS]
  },
  tasks: {
    status: [...TASK_STATUS_OPTIONS],
    type: [...TASK_TYPE_OPTIONS],
    priority: [...TASK_PRIORITY_OPTIONS]
  }
};

const preferNonEmpty = (primary: string[] | undefined, fallback: string[]): string[] => {
  if (Array.isArray(primary) && primary.length > 0) return primary;
  return fallback;
};

export function useNotionOptions() {
  const [options, setOptions] = useState<NotionOptions>(defaults);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/options");
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !data?.options) return;
        const next: NotionOptions = {
          leads: {
            status: preferNonEmpty(data.options.leads?.status, defaults.leads.status),
            priority: preferNonEmpty(data.options.leads?.priority, defaults.leads.priority),
            channel: preferNonEmpty(data.options.leads?.channel, defaults.leads.channel)
          },
          tasks: {
            status: preferNonEmpty(data.options.tasks?.status, defaults.tasks.status),
            type: preferNonEmpty(data.options.tasks?.type, defaults.tasks.type),
            priority: preferNonEmpty(data.options.tasks?.priority, defaults.tasks.priority)
          }
        };
        setOptions(next);
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return options;
}
