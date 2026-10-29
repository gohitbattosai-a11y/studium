import { useEffect, useState } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tab } from "@/components/layout/AppShell";

export interface NavItem {
  id: Tab;
  label: string;
  icon: LucideIcon;
}

const PRIMARY: Tab[] = ["home", "compiti", "giochi", "shop"];

export default function MobileNav({ items, tab, onGo }: { items: NavItem[]; tab: Tab; onGo: (t: Tab) => void }) {
  const [more, setMore] = useState(false);
  const primary = items.filter((i) => PRIMARY.includes(i.id));
  const rest = items.filter((i) => !PRIMARY.includes(i.id));
  const restActive = rest.some((i) => i.id === tab);

  useEffect(() => {
    setMore(false);
  }, [tab]);

  const pill = (active: boolean) =>
    cn("grid h-8 w-14 place-items-center rounded-full transition-colors duration-150", active ? "bg-[#388BFD]/15 text-[#58A6FF]" : "text-[#8B949E]");
  const label = (active: boolean) => cn("text-[11px] leading-none", active ? "text-[#F0F6FC]" : "text-[#8B949E]");

  return (
    <>
      {more && <button type="button" aria-label="Chiudi" className="fixed inset-0 z-40 cursor-default md:hidden" onClick={() => setMore(false)} />}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#30363D] bg-[#161B22]/95 pb-[env(safe-area-inset-bottom)] md:hidden" data-testid="bottom-nav">
        {more && (
          <div className="absolute right-3 bottom-full mb-2 w-48 rounded-xl border border-[#30363D] bg-[#161B22] p-1.5 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-150" data-testid="nav-more-menu">
            {rest.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onGo(n.id)}
                data-testid={`nav-tab-${n.id}`}
                className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm active:scale-[0.98]", tab === n.id ? "bg-[#388BFD]/15 text-[#F0F6FC]" : "text-[#C9D1D9]")}
              >
                <n.icon className={cn("size-[18px]", tab === n.id ? "text-[#58A6FF]" : "text-[#8B949E]")} />
                {n.label}
              </button>
            ))}
          </div>
        )}
        <div className="grid h-16 grid-cols-5">
          {primary.map((n) => {
            const active = tab === n.id;
            return (
              <button key={n.id} type="button" onClick={() => onGo(n.id)} data-testid={`nav-tab-${n.id}`} aria-current={active ? "page" : undefined} className="flex flex-col items-center justify-center gap-1 transition-transform duration-100 active:scale-95">
                <span className={pill(active)}>
                  <n.icon className="size-5" />
                </span>
                <span className={label(active)}>{n.label}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} data-testid="nav-tab-more" className="flex flex-col items-center justify-center gap-1 transition-transform duration-100 active:scale-95">
            <span className={pill(restActive || more)}>
              <MoreHorizontal className="size-5" />
            </span>
            <span className={label(restActive || more)}>Altro</span>
          </button>
        </div>
      </nav>
    </>
  );
}
