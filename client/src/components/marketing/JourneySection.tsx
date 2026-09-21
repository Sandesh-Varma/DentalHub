import { motion } from "framer-motion";
import { Calendar, ClipboardCheck, Search, Sparkles, HeartHandshake } from "lucide-react";
import { SectionHeader, SectionShell } from "./SectionShell";
import { fadeUp, staggerContainer } from "@/lib/motion";

const steps = [
  {
    icon: Calendar,
    title: "Book appointment",
    desc: "Select your provider, preferred date, and time through our secure patient portal.",
  },
  {
    icon: ClipboardCheck,
    title: "Consultation",
    desc: "Arrive for a thorough intake. We review your history and discuss your goals.",
  },
  {
    icon: Search,
    title: "Diagnosis",
    desc: "Digital imaging and clinical assessment produce a clear, written treatment plan.",
  },
  {
    icon: Sparkles,
    title: "Treatment",
    desc: "Procedures are performed with precision techniques and comfort-first protocols.",
  },
  {
    icon: HeartHandshake,
    title: "Follow-up",
    desc: "Post-care guidance and scheduled check-ins ensure lasting results.",
  },
];

export function JourneySection() {
  return (
    <SectionShell id="journey" className="bg-surface">
      <SectionHeader
        eyebrow="Your treatment journey"
        title="From first click to lasting smile"
        description="A structured path designed to eliminate uncertainty at every stage of your care."
        align="center"
      />
      <motion.ol
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative mx-auto max-w-4xl"
      >
        <div
          aria-hidden
          className="absolute left-6 top-0 h-full w-px bg-border md:left-1/2"
        />
        {steps.map((step, i) => (
          <motion.li
            key={step.title}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className={`relative mb-12 flex flex-col gap-2 pl-16 md:mb-16 md:flex-row md:items-center md:pl-0 ${
              i % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className={`flex-1 ${i % 2 === 0 ? "md:text-right md:pr-16" : "md:text-left md:pl-16"}`}>
              <span className="text-xs font-semibold tracking-widest text-accent">
                Step {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.desc}</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="absolute left-6 -translate-x-1/2 top-1.5 z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-[var(--shadow-soft)] md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2"
            >
              <step.icon className="h-5 w-5 text-navy" strokeWidth={1.5} />
            </motion.div>
            <div className="hidden flex-1 md:block" />
          </motion.li>
        ))}
      </motion.ol>
    </SectionShell>
  );
}
