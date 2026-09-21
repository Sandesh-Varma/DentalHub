import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeader, SectionShell } from "./SectionShell";
import { easeOut } from "@/lib/motion";

const reviews = [
  {
    quote:
      "I booked online at 9pm and had a confirmation by morning. The consultation was thorough — no pressure, just clear options.",
    name: "Sarah M.",
    detail: "Cosmetic veneer consultation",
  },
  {
    quote:
      "As someone who avoided dentists for years, the team made me feel at ease from the first visit. Transparent pricing and gentle care.",
    name: "James R.",
    detail: "Restorative treatment",
  },
  {
    quote:
      "The patient portal keeps everything organized — appointments, notes, follow-ups. It feels like healthcare designed for real life.",
    name: "Priya K.",
    detail: "Preventive care patient",
  },
];

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const current = reviews[index];

  const prev = () => setIndex((i) => (i === 0 ? reviews.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === reviews.length - 1 ? 0 : i + 1));

  return (
    <SectionShell className="bg-surface">
      <SectionHeader
        eyebrow="Patient voices"
        title="Trusted by people who value their smile"
        align="center"
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <Quote className="mx-auto h-8 w-8 text-accent/60" strokeWidth={1} />
        <div className="mt-8 min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: easeOut }}
            >
              <p className="text-xl leading-relaxed text-foreground md:text-2xl">
                &ldquo;{current.quote}&rdquo;
              </p>
              <footer className="mt-8">
                <cite className="not-italic font-semibold text-navy">{current.name}</cite>
                <p className="mt-1 text-sm text-muted">{current.detail}</p>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-navy/30 hover:bg-background"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-navy" : "w-1.5 bg-border"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-navy/30 hover:bg-background"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
