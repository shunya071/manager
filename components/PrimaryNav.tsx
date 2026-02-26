"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/leads", label: "Leads", sub: "営業先" },
  { href: "/clients", label: "Clients", sub: "顧客" },
  { href: "/projects", label: "Projects", sub: "案件" },
  { href: "/worklogs", label: "WorkLogs", sub: "稼働" },
  { href: "/invoices", label: "Invoices", sub: "請求" },
  { href: "/transactions", label: "Transactions", sub: "入出金" }
];

export default function PrimaryNav() {
  const pathname = usePathname();

  return (
    <nav className="primary-nav" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="nav-label">{item.label}</span>
            <span className="nav-sub">{item.sub}</span>
          </Link>
        );
      })}
    </nav>
  );
}
