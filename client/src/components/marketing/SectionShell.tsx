import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

type Props = {
  id?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  stagger?: boolean;
};

export function SectionShell({ id, children, className, dark, stagger }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id={id}
      ref={ref}
      className={cn("section-pad", dark ? "bg-navy text-white" : "bg-background", className)}
    >
      <motion.div
        className="container-marketing"
        variants={stagger ? staggerContainer : undefined}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {stagger ? (
          <motion.div variants={fadeUp}>{children}</motion.div>
        ) : (
          children
        )}
      </motion.div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  light,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-14 max-w-2xl",
        align === "center" && "mx-auto text-center"
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-4 text-xs font-semibold uppercase tracking-[0.2em]",
            light ? "text-accent-muted" : "text-muted"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "heading-section text-balance",
          light ? "text-white" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed",
            light ? "text-white/70" : "text-muted"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
