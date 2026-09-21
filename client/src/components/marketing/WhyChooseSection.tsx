import { motion } from "framer-motion";
import { SectionHeader, SectionShell } from "./SectionShell";

const points = [
  {
    num: "01",
    title: "Clinical transparency",
    body: "Every diagnosis is explained in plain language. You receive written treatment options before any procedure begins.",
  },
  {
    num: "02",
    title: "Technology-led precision",
    body: "Digital scanning, 3D planning, and minimally invasive techniques reduce chair time and improve outcomes.",
  },
  {
    num: "03",
    title: "Continuity of care",
    body: "Your records, imaging, and appointment history live in one secure portal — accessible to you and your care team.",
  },
];

export function WhyChooseSection() {
  return (
    <SectionShell className="bg-surface">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
        <SectionHeader
          eyebrow="Why DentFlow"
          title="Healthcare that respects your time and trust"
          description="We built our practice around what patients told us they needed most: clarity, consistency, and care that feels personal — not transactional."
        />
        <div className="space-y-0 divide-y divide-border border border-border rounded-2xl bg-background">
          {points.map((p, i) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group p-8 transition-colors hover:bg-surface"
            >
              <span className="text-xs font-semibold tracking-widest text-accent">{p.num}</span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
