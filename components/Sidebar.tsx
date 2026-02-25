"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export type NavChild = { href: string; label: string };
export type NavItem =
  | { href: string; label: string; disabled?: boolean; children?: never; onClick?: never }
  | { href?: never; label: string; disabled?: never; children: NavChild[]; onClick?: never }
  | { href?: never; label: string; disabled?: never; children?: never; onClick: () => void };

export function Sidebar({ items }: { items: NavItem[] }) {
  const path = usePathname();

  // determine which accordion parents should start open (if a child is active)
  function childIsActive(children: NavChild[]) {
    return children.some(c => path === c.href || path.startsWith(c.href + "/"));
  }

  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach(it => {
      if (it.children) {
        initial[it.label] = childIsActive(it.children);
      }
    });
    return initial;
  });

  useEffect(() => {
    items.forEach(it => {
      if (it.children && childIsActive(it.children)) {
        setOpenAccordions(prev => ({ ...prev, [it.label]: true }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  function toggleAccordion(label: string) {
    setOpenAccordions(prev => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <aside className="glass h-fit w-full p-3 md:w-64">
      <div className="space-y-1">
        {items.map((it) => {
          // Accordion parent
          if (it.children) {
            const isOpen = openAccordions[it.label] ?? false;
            const anyChildActive = childIsActive(it.children);
            return (
              <div key={it.label}>
                <button
                  type="button"
                  onClick={() => toggleAccordion(it.label)}
                  className={
                    "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-white/10 " +
                    (anyChildActive ? "bg-white/10 border border-white/20" : "")
                  }
                >
                  <span>{it.label}</span>
                  <span className="text-white/60 text-xs">{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <div className="mt-1 ml-3 space-y-1 border-l border-white/15 pl-3">
                    {it.children.map(child => {
                      const active = path === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={
                            "block rounded-xl px-3 py-1.5 text-sm transition " +
                            (active ? "bg-white/15 border border-white/25" : "hover:bg-white/10")
                          }
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Action item (e.g. Logout)
          if (it.onClick) {
            return (
              <button
                key={it.label}
                type="button"
                onClick={it.onClick}
                className="w-full text-left rounded-xl px-3 py-2 text-sm transition hover:bg-white/10 text-white/80 hover:text-white"
              >
                {it.label}
              </button>
            );
          }

          // Regular link
          const active = path === it.href || (it.href !== "/" && path.startsWith(it.href + "/"));
          const cls =
            "block w-full rounded-xl px-3 py-2 text-sm transition " +
            (it.disabled
              ? "cursor-not-allowed opacity-50"
              : active
              ? "bg-white/15 border border-white/25"
              : "hover:bg-white/10");

          return it.disabled ? (
            <div key={it.href ?? it.label} className={cls}>{it.label}</div>
          ) : (
            <Link key={it.href} className={cls} href={it.href!}>{it.label}</Link>
          );
        })}
      </div>
    </aside>
  );
}
