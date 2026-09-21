import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import { SectionHeader, SectionShell } from "./SectionShell";
import { images } from "@/lib/images";

export function GallerySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(50);
  const clip = useTransform(x, (v) => `inset(0 ${100 - v}% 0 0)`);
  const dividerLeft = useTransform(x, (v) => `${v}%`);

  const handleMove = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    x.set(Math.min(100, Math.max(0, pct)));
  };

  return (
    <SectionShell id="gallery">
      <SectionHeader
        eyebrow="Smile transformations"
        title="Results that speak for themselves"
        description="Drag the slider to compare treatment outcomes. Every case is planned individually — your smile is unique."
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        ref={containerRef}
        className="relative mx-auto max-w-3xl cursor-ew-resize select-none overflow-hidden rounded-2xl border border-border"
        onMouseMove={(e) => handleMove(e.clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        <img src={images.galleryAfter} alt="After treatment" className="aspect-[16/10] w-full object-cover" />
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <img src={images.galleryBefore} alt="Before treatment" className="h-full w-full object-cover" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-lg"
          style={{ left: dividerLeft }}
        />
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-md bg-navy/80 px-3 py-1 text-xs font-medium text-white">
          Before
        </div>
        <div className="pointer-events-none absolute bottom-4 right-4 rounded-md bg-navy/80 px-3 py-1 text-xs font-medium text-white">
          After
        </div>
      </motion.div>
      <p className="mt-6 text-center text-xs text-muted">
        Illustrative comparison. Individual results vary based on treatment plan.
      </p>
    </SectionShell>
  );
}
