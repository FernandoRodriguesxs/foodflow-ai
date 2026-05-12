"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth-client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Pedidos", icon: LayoutDashboard },
  { href: "/dashboard/conversas", label: "Conversas", icon: MessageSquare },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function handleLogout(): void {
    logout();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-(--color-muted)">
      <aside className="hidden w-64 flex-col border-r border-(--color-border) bg-(--color-card) lg:flex">
        <div className="flex h-16 items-center border-b border-(--color-border) px-6">
          <span className="text-lg font-semibold tracking-tight">FoodFlow</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-(--color-foreground) hover:bg-(--color-muted)"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-(--color-border) p-3">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-(--color-border) bg-(--color-card) px-6">
          <h1 className="text-base font-semibold">Painel de pedidos</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
