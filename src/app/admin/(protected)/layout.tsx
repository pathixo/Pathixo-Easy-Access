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
    super_admin: "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/30 font-mono",
    admin: "bg-sky-500/10 text-sky-400 border-sky-500/30 font-mono",
    viewer: "bg-neutral-500/10 text-neutral-400 border-neutral-500/30 font-mono",
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
    <div className="flex min-h-screen bg-[#0a0b0c] text-[#f4f4f5]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col justify-between border-r border-[#252a31] bg-[#101214] p-5 md:flex">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-2.5 px-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ccff00] font-black text-black shadow-cyber-sm">
              ◆
            </span>
            <div>
              <h2 className="font-mono text-sm font-black text-white tracking-wider">PATHIXO // HQ</h2>
              <p className="font-mono text-[10px] text-neutral-400">EXPO COMMAND CENTER</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-neutral-300 transition hover:bg-[#181b20] hover:text-[#ccff00] hover:border hover:border-[#ccff00]/30"
                >
                  <Icon className="h-4 w-4 text-neutral-400 group-hover:text-[#ccff00]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-[#252a31] pt-4 px-2">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="truncate text-xs font-bold text-white">{admin.full_name || admin.email}</p>
              <span
                className={`mt-1 inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
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
        <header className="flex h-16 items-center justify-between border-b border-[#252a31] bg-[#101214]/80 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ccff00] text-xs font-black text-black">
              ◆
            </span>
            <span className="font-mono text-xs font-bold text-white">Pathixo Admin</span>
          </div>

          <div className="hidden items-center gap-2 font-mono text-xs text-neutral-400 sm:flex">
            <Clock className="h-3.5 w-3.5 text-[#ccff00]" />
            <span>Timezone: Asia/Kolkata (IST)</span>
          </div>

          {/* Mobile Nav Links */}
          <div className="flex items-center gap-3 md:hidden font-mono">
            <Link href="/admin/leads" className="text-xs text-neutral-300 hover:text-white">
              Leads
            </Link>
            <Link href="/admin/lucky-draw" className="text-xs text-[#ccff00] font-bold">
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
