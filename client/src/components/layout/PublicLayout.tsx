import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/marketing/MagneticButton";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

const pageLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const homeAnchors = [
  { href: "#services", label: "Services" },
  { href: "#team", label: "Team" },
  { href: "#journey", label: "Journey" },
  { href: "#faq", label: "FAQ" },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-border/80 bg-surface/90 shadow-[var(--shadow-soft)] backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div className="container-marketing flex h-16 items-center justify-between">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-navy"
          >
            DentFlow
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {pageLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "text-sm transition-colors",
                  pathname === l.to
                    ? "font-medium text-foreground"
                    : "text-muted hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
            {homeAnchors.map((l) => (
              <a
                key={l.href}
                href={isHome ? l.href : `/${l.href}`}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <MagneticButton to="/login" variant="ghost" className="!px-4 !py-2">
              Sign in
            </MagneticButton>
            <MagneticButton to="/register" className="!px-4 !py-2">
              Book now
            </MagneticButton>
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-muted lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border bg-surface px-4 py-4 lg:hidden">
            {pageLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "block py-2.5 text-sm",
                  pathname === l.to ? "font-medium text-foreground" : "text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
            {homeAnchors.map((l) => (
              <a
                key={l.href}
                href={isHome ? l.href : `/${l.href}`}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm text-muted"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-4 flex gap-3 border-t border-border pt-4">
              <MagneticButton to="/login" variant="outline" className="flex-1 justify-center">
                Sign in
              </MagneticButton>
              <MagneticButton to="/register" className="flex-1 justify-center">
                Book now
              </MagneticButton>
            </div>
          </div>
        )}
      </header>

      <main>{pathname === "/" ? <Outlet /> : <div className="pt-16"><Outlet /></div>}</main>

      <MarketingFooter />
    </div>
  );
}
