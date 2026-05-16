import { Bell, FolderKanban, LayoutDashboard, LogOut } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/auth";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban }
];

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const title = location.pathname.startsWith("/projects") ? "Projects" : "Dashboard";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#312e8140,transparent_38%),var(--bg-base)]">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-20 border-r border-[color:var(--border)] bg-[color:var(--bg-surface)]/80 backdrop-blur-xl md:block xl:w-64">
        <div className="flex h-full flex-col p-4">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-bold">T</div>
            <span className="hidden text-lg font-bold xl:block">Task Manager</span>
          </div>
          <nav className="space-y-2">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${isActive ? "bg-indigo-500/15 text-white" : "text-[color:var(--text-secondary)] hover:bg-white/5"}`}>
                <item.icon size={20} /><span className="hidden xl:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto">
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-white/5 p-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-500/30 text-sm font-semibold">{user?.name.slice(0, 1)}</div>
              <div className="hidden min-w-0 xl:block">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-[color:var(--text-secondary)]">{user?.email}</p>
              </div>
            </div>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-[color:var(--text-secondary)] hover:bg-white/5" onClick={() => { logout(); navigate("/login"); }}>
              <LogOut size={20} /><span className="hidden xl:inline">Logout</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="pb-20 md:ml-20 md:pb-0 xl:ml-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--bg-base)]/70 px-4 backdrop-blur-xl lg:px-8">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-xs text-[color:var(--text-secondary)]">Workspace / {title}</p>
          </div>
          <button className="rounded-lg border border-[color:var(--border)] p-2 text-[color:var(--text-secondary)] hover:border-[color:var(--border-hover)]" aria-label="Notifications">
            <Bell size={18} />
          </button>
        </header>
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="p-4 lg:p-8">
          <Outlet />
        </motion.div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t border-[color:var(--border)] bg-[color:var(--bg-surface)]/95 p-2 backdrop-blur-xl md:hidden">
        {nav.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center rounded-lg py-2 text-xs ${isActive ? "text-white" : "text-[color:var(--text-secondary)]"}`}><item.icon size={20} />{item.label}</NavLink>)}
      </nav>
    </div>
  );
}
