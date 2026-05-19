"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/documents", label: "Documentos" },
  { href: "/documents/upload", label: "Subir" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav>
      {/* Desktop */}
      <ul className="hidden gap-4 sm:flex">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                pathname.startsWith(link.href)
                  ? "text-accent"
                  : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile hamburger */}
      <button
        className="sm:hidden rounded p-1 text-muted hover:text-foreground"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {open && (
        <ul className="absolute left-0 top-16 w-full border-b border-border bg-white p-4 sm:hidden">
          {links.map((link) => (
            <li key={link.href} className="py-2">
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block text-sm font-medium ${
                  pathname.startsWith(link.href)
                    ? "text-accent"
                    : "text-muted"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
