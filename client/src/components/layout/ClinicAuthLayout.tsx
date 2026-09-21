import { Outlet } from "react-router-dom";

export function ClinicAuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary/95 to-primary/30">
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto max-w-6xl">
          <span className="text-lg font-bold text-white">DentFlow</span>
          <p className="text-xs text-teal-100/80">Practice management</p>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <Outlet />
      </main>
    </div>
  );
}
