"use client";

type ToastType = "success" | "error" | "info";

const emit = (message: string, type: ToastType) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));
};

export const toastSuccess = (message: string) => emit(message, "success");
export const toastError = (message: string) => emit(message, "error");
export const toastInfo = (message: string) => emit(message, "info");
