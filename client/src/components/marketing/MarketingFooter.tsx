import { Link } from "react-router-dom";

const sections = [
  {
    title: "Clinic",
    links: [
      { label: "Services", href: "/#services" },
      { label: "Our team", href: "/#team" },
      { label: "Patient journey", href: "/#journey" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Patients",
    links: [
      { label: "Book appointment", href: "/register" },
      { label: "Sign in", href: "/login" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Staff",
    links: [{ label: "Clinic portal", href: "/clinic/login" }],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-marketing grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Link to="/" className="text-xl font-semibold tracking-tight text-navy">
            DentFlow
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Premium dental care with modern booking, transparent treatment planning, and
            a patient experience built for trust.
          </p>
        </div>
        {sections.map((s) => (
          <div key={s.title}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {s.title}
            </p>
            <ul className="mt-4 space-y-3">
              {s.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-navy"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-6">
        <div className="container-marketing flex flex-col items-center justify-between gap-4 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} DentFlow. All rights reserved.</p>
          <p>Mon – Sat, 9:00 – 18:00 · hello@dentflow.com</p>
        </div>
      </div>
    </footer>
  );
}
