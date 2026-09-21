import { motion } from "framer-motion";
import { Award, Users, Star } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { SectionShell } from "./SectionShell";
import { fadeUp, staggerContainer } from "@/lib/motion";

const metrics = [
  { value: 18, suffix: "+", label: "Years in practice", icon: Award },
  { value: 12400, suffix: "+", label: "Patients treated", icon: Users },
  { value: 97, suffix: "%", label: "Would recommend us", icon: Star },
];

export function TrustSection() {
  return (
    <SectionShell className="border-y border-border bg-surface !py-16">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-10 sm:grid-cols-3"
      >
        {metrics.map((m) => (
          <motion.div
            key={m.label}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center sm:text-left"
          >
            <m.icon className="mx-auto mb-4 h-5 w-5 text-accent sm:mx-0" strokeWidth={1.5} />
            <p className="text-4xl font-semibold tracking-tight text-navy">
              <AnimatedCounter value={m.value} suffix={m.suffix} />
            </p>
            <p className="mt-2 text-sm text-muted">{m.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  );
}
