import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Calendar,
  CalendarPlus,
  LayoutDashboard,
  LogOut,
  Users,
  Bell,
  TrendingUp,
  UserCog,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRole } from "@/lib/roles";
import { PageTransition } from "@/components/motion/PageTransition";

const doctorNav = [
  { to: "/clinic", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clinic/growth", label: "Growth", icon: TrendingUp },
  { to: "/clinic/team", label: "Team", icon: UserCog },
  { to: "/clinic/patients", label: "Patients", icon: Users },
  { to: "/clinic/appointments", label: "Appointments", icon: Calendar },
  { to: "/clinic/book", label: "Book for patient", icon: CalendarPlus },
  { to: "/clinic/availability", label: "Availability", icon: Calendar },
  { to: "/clinic/profile", label: "My profile", icon: UserCircle },
];

const receptionistNav = [
  { to: "/clinic", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clinic/patients", label: "Patients", icon: Users },
  { to: "/clinic/appointments", label: "Appointments", icon: Calendar },
  { to: "/clinic/book", label: "Book for patient", icon: CalendarPlus },
  { to: "/clinic/notifications", label: "Notifications", icon: Bell },
];

export function ClinicLayout() {
  const { user, logout } = useAuth();
  const nav = user?.role === "DOCTOR" ? doctorNav : receptionistNav;

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-secondary p-4 text-white md:flex">
        <div className="mb-8">
          <div className="text-xl font-bold tracking-tight">DentFlow</div>
          <p className="mt-1 text-xs text-teal-200/80">Practice dashboard</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/clinic"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  isActive ? "bg-primary text-white shadow-sm" : "text-teal-100/90 hover:bg-white/10"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="mt-4 justify-start text-teal-100 hover:bg-white/10 hover:text-white"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
          <div>
            <p className="text-xs text-muted">Signed in</p>
            <p className="font-semibold text-foreground">{user?.name}</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {formatRole(user?.role)}
          </span>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-surface md:hidden">
          {nav.slice(0, 4).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted"
            >
              <item.icon className="h-4 w-4" />
              {item.label.split(" ")[0]}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
