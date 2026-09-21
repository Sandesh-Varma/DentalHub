import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Calendar,
  CalendarPlus,
  LayoutDashboard,
  LogOut,
  Bell,
  UserCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/motion/PageTransition";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/book", label: "Book", icon: CalendarPlus },
  { to: "/app/appointments", label: "Appointments", icon: Calendar },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/profile", label: "Profile", icon: UserCircle },
];

export function PatientLayout() {
  const { user, logout } = useAuth();

  const { data: dash } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data,
  });

  const unread = dash?.stats?.unreadCount ?? 0;

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="border-b border-border px-5 py-5">
          <Link to="/" className="text-base font-semibold text-foreground">
            DentFlow
          </Link>
          <p className="mt-0.5 text-xs text-muted">Patient</p>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-slate-100 font-medium text-foreground"
                    : "text-muted hover:bg-slate-50 hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
              {item.to === "/app/notifications" && unread > 0 && (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
          <p className="text-sm text-muted md:hidden">
            <span className="font-medium text-foreground">{user?.name}</span>
          </p>
          <p className="hidden text-sm text-muted md:block">
            Signed in as <span className="font-medium text-foreground">{user?.name}</span>
          </p>
          <Link to="/app/book" className="md:hidden">
            <Button size="sm">Book</Button>
          </Link>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 p-4 md:p-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-surface md:hidden">
          {nav.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
                  isActive ? "font-medium text-primary" : "text-muted"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label.split(" ")[0]}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
