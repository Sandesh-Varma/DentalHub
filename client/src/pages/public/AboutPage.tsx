import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { MagneticButton } from "@/components/marketing/MagneticButton";

const values = [
  {
    title: "Patient-first design",
    text: "Every workflow — booking, reminders, records — is built around how patients actually live, not how clinics used to operate.",
  },
  {
    title: "Clinical integrity",
    text: "Treatment recommendations follow evidence-based guidelines. We explain the why behind every procedure before you decide.",
  },
  {
    title: "Transparent technology",
    text: "Your data stays secure, accessible, and under your control. No opaque systems, no hidden fees.",
  },
];

export function AboutPage() {
  return (
    <div className="section-pad">
      <div className="container-marketing max-w-3xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            About DentFlow
          </p>
          <h1 className="heading-section mt-4 text-balance">
            Modern dentistry, thoughtfully delivered
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            DentFlow was founded on a simple premise: exceptional dental care should be as
            easy to access as it is to trust. We combine licensed clinical expertise with a
            digital patient experience that respects your time.
          </p>
        </motion.div>

        <div className="mt-16 space-y-0 divide-y divide-border border border-border rounded-2xl bg-surface">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-8"
            >
              <h2 className="text-lg font-semibold tracking-tight">{v.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14">
          <MagneticButton to="/register">Book your first visit</MagneticButton>
        </div>
      </div>
    </div>
  );
}
