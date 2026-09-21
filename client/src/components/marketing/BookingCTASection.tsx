import { motion } from "framer-motion";
import { MagneticButton } from "./MagneticButton";
import { SectionShell } from "./SectionShell";
import { fadeUp } from "@/lib/motion";

export function BookingCTASection() {
  return (
    <SectionShell dark className="!py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-muted">
          Ready when you are
        </p>
        <h2 className="heading-section mt-5 text-balance text-white">
          Your next appointment is three minutes away
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-white/70">
          Join thousands of patients who manage their dental care online — book, reschedule,
          and stay informed without a single phone call.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton to="/register" className="!bg-white !text-navy hover:!bg-white/90">
            Create patient account
          </MagneticButton>
          <MagneticButton
            to="/contact"
            variant="outline"
            className="!border-white/20 !bg-transparent !text-white hover:!bg-white/10"
          >
            Contact the clinic
          </MagneticButton>
        </div>
      </motion.div>
    </SectionShell>
  );
}
