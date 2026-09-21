import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { SectionHeader, SectionShell } from "./SectionShell";

const partners = [
  "Delta Dental",
  "Cigna",
  "Aetna",
  "MetLife",
  "Guardian",
  "UnitedHealthcare",
];

const assurances = [
  "We verify benefits before your visit and provide written cost estimates.",
  "Flexible payment plans available for treatments not fully covered.",
  "HSA and FSA accepted for eligible procedures.",
];

export function InsuranceSection() {
  return (
    <SectionShell className="border-y border-border bg-surface !py-16">
      <SectionHeader
        eyebrow="Insurance & partners"
        title="Coverage clarity before you commit"
        description="We work with major dental insurers and help you understand your benefits — no surprises at checkout."
        align="center"
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6"
      >
        {partners.map((p) => (
          <motion.span
            key={p}
            variants={fadeUp}
            className="text-sm font-medium tracking-wide text-muted"
          >
            {p}
          </motion.span>
        ))}
      </motion.div>
      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3"
      >
        {assurances.map((a) => (
          <motion.li
            key={a}
            variants={fadeUp}
            className="flex gap-3 rounded-xl border border-border bg-background p-5 text-sm leading-relaxed text-muted"
          >
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-navy" strokeWidth={1.5} />
            {a}
          </motion.li>
        ))}
      </motion.ul>
    </SectionShell>
  );
}
