import { requireAdmin } from "@/lib/admin/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, Gift, ShieldAlert, History, LogOut, Clock } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const roleBadgeColors = {
    super_admin: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    admin: "bg-brand-500/10 text-brand-400 border-brand-500/30",
    viewer: "bg-neutral-500/10 text-neutral-400 border-neutral-500/30",
  };

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Leads & Visitors", href: "/admin/leads", icon: Users },
    { label: "Business Inquiries", href: "/admin/inquiries", icon: MessageSquare },
    { label: "Lucky Draw & Redeem", href: "/admin/lucky-draw", icon: Gift },
    ...(admin.role === "super_admin"
      ? [{ label: "Rewards Config", href: "/admin/rewards", icon: ShieldAlert }]
      : []),
    { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
  ];

  return (
    <div className="flex min-h-screen bg-[#09090b] text-[#f4f4f5]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col justify-between border-r border-white/10 bg-[#0d0d12] p-5 md:flex">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-2.5 px-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-extrabold text-white">
              P
            </span>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">PATHIXO ADMIN</h2>
              <p className="text-[10px] text-neutral-400">Expo Mart Digital Pavilion</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-neutral-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-white/10 pt-4 px-2">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="truncate text-xs font-semibold text-white">{admin.full_name || admin.email}</p>
              <span
                className={`mt-1 inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  roleBadgeColors[admin.role]
                }`}
              >
                {admin.role.replace("_", " ")}
              </span>
            </div>
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0d0d12]/60 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
              P
            </span>
            <span className="text-xs font-bold text-white">Pathixo Admin</span>
          </div>

          <div className="hidden items-center gap-2 text-xs text-neutral-400 sm:flex">
            <Clock className="h-3.5 w-3.5 text-brand-400" />
            <span>Timezone: Asia/Kolkata (IST)</span>
          </div>

          {/* Mobile Nav Links */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/admin/leads" className="text-xs text-neutral-300">
              Leads
            </Link>
            <Link href="/admin/lucky-draw" className="text-xs text-brand-400 font-semibold">
              Redeem
            </Link>
            <AdminLogoutButton />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
