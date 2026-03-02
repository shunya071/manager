"use client";

const emit = (delta: number) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app:loading", { detail: { delta } }));
};

export const startLoading = () => emit(1);
export const stopLoading = () => emit(-1);
