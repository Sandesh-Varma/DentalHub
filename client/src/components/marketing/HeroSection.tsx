import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { MagneticButton } from "./MagneticButton";
import { images } from "@/lib/images";
import { easeOut, fadeUp, slideFromRight } from "@/lib/motion";

export function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-background">
      <div className="container-marketing flex min-h-[100svh] flex-col justify-center pb-16 pt-28 lg:pb-24 lg:pt-32">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1, delayChildren: 0.15 }}
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7, ease: easeOut }}
              className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
            >
              Premier dental care
            </motion.p>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.8, ease: easeOut }}
              className="heading-display mt-6 text-balance text-foreground"
            >
              Exceptional dentistry,{" "}
              <span className="text-navy-soft">booked in minutes.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.8, ease: easeOut, delay: 0.05 }}
              className="mt-7 max-w-lg text-lg leading-relaxed text-muted"
            >
              Schedule consultations with board-certified specialists, manage your
              treatment plan online, and experience clinical care designed around your
              comfort.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8, ease: easeOut, delay: 0.1 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <MagneticButton to="/register">Book your visit</MagneticButton>
              <MagneticButton to="/login" variant="outline">
                Patient sign in
              </MagneticButton>
            </motion.div>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8, ease: easeOut, delay: 0.15 }}
              className="mt-12 flex flex-wrap gap-8 border-t border-border pt-8"
            >
              {[
                { icon: Shield, label: "Licensed specialists" },
                { icon: Clock, label: "Same-week availability" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm text-muted">
                  <item.icon className="h-4 w-4 text-navy" strokeWidth={1.5} />
                  {item.label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            style={{ opacity }}
            className="relative hidden lg:block"
          >
            <motion.div
              variants={slideFromRight}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.9, ease: easeOut, delay: 0.25 }}
              className="relative"
            >
              <motion.div style={{ y: imageY }} className="overflow-hidden rounded-2xl">
                <img
                  src={images.clinic}
                  alt="DentFlow clinic interior"
                  className="aspect-[4/5] w-full object-cover"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7, ease: easeOut }}
                className="absolute -bottom-8 -left-8 w-[min(100%,320px)] rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Next available
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  Consultation slots open
                </p>
                <p className="mt-2 text-sm text-muted">
                  Reserve online — confirmation within 2 hours.
                </p>
                <Link
                  to="/register"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-navy hover:underline"
                >
                  Check availability
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        animate={{ y: [0, -20, 0], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </section>
  );
}
