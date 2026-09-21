import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";
import { easeOut } from "@/lib/motion";
import { SectionHeader, SectionShell } from "./SectionShell";

const faqs = [
  {
    q: "How do I book my first appointment?",
    a: "Create a free patient account, select your preferred dentist, and choose an available time slot. You'll receive email confirmation once the clinic verifies your booking.",
  },
  {
    q: "What should I bring to my consultation?",
    a: "Bring a valid ID, your insurance card if applicable, and a list of current medications. Previous dental records or X-rays are helpful but not required.",
  },
  {
    q: "Do you offer emergency appointments?",
    a: "Same-day emergency slots are reserved daily. Call the clinic directly for urgent pain, trauma, or swelling — our team will prioritize your case.",
  },
  {
    q: "Can I reschedule or cancel online?",
    a: "Yes. Log into your patient portal to modify appointments at least 24 hours before your scheduled time. Late cancellations may incur a fee per clinic policy.",
  },
  {
    q: "Is my health information secure?",
    a: "All records are encrypted and stored in compliance with healthcare privacy standards. Only authorized clinical staff can access your treatment history.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-6 text-left"
        aria-expanded={open}
      >
        <span className="font-medium tracking-tight text-foreground">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: easeOut }}
          className="shrink-0 text-muted"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm leading-relaxed text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  return (
    <SectionShell id="faq">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <SectionHeader
          eyebrow="Common questions"
          title="Everything you need to know before your visit"
        />
        <div>
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
