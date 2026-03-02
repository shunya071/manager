"use client";

import { useEffect, useRef, useState } from "react";

export default function TopLoadingBar() {
  const [active, setActive] = useState(false);
  const counter = useRef(0);

  useEffect(() => {
    const onLoading = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const delta = typeof detail?.delta === "number" ? detail.delta : 0;
      counter.current = Math.max(0, counter.current + delta);
      setActive(counter.current > 0);
    };
    window.addEventListener("app:loading", onLoading);
    return () => window.removeEventListener("app:loading", onLoading);
  }, []);

  return (
    <div className={`top-loading${active ? " is-active" : ""}`}>
      <div className="top-loading-bar" />
    </div>
  );
}
