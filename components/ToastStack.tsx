"use client";

import { useEffect, useState } from "react";

type ToastItem = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

export default function ToastStack() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const message = typeof detail?.message === "string" ? detail.message : "";
      const type = detail?.type ?? "info";
      if (!message) return;
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const next: ToastItem = { id, message, type };
      setItems((prev) => {
        const combined = [...prev, next];
        return combined.slice(-3);
      });
      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 2600);
    };
    window.addEventListener("app:toast", onToast);
    return () => window.removeEventListener("app:toast", onToast);
  }, []);

  return (
    <div className="toast-stack" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={`toast toast-${item.type}`}>
          {item.message}
        </div>
      ))}
    </div>
  );
}
