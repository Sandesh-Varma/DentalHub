import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader, SectionShell } from "./SectionShell";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { images } from "@/lib/images";

const services = [
  {
    title: "General & preventive",
    desc: "Comprehensive exams, digital imaging, and hygiene programs tailored to long-term oral health.",
    image: images.care,
  },
  {
    title: "Cosmetic dentistry",
    desc: "Veneers, whitening, and smile design guided by aesthetic principles and natural proportions.",
    image: images.smile,
  },
  {
    title: "Restorative care",
    desc: "Implants, crowns, and precision restorations using contemporary materials and techniques.",
    image: images.dentist,
  },
];

export function ServicesSection() {
  return (
    <SectionShell id="services">
      <SectionHeader
        eyebrow="Clinical services"
        title="Comprehensive care under one roof"
        description="From routine prevention to advanced restoration — every treatment is planned with clarity and delivered with precision."
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid gap-6 lg:grid-cols-3"
      >
        {services.map((s, i) => (
          <motion.article
            key={s.title}
            variants={fadeUp}
            transition={{ duration: 0.65, delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl bg-surface"
          >
            <div className="aspect-[5/4] overflow-hidden">
              <motion.img
                src={s.image}
                alt={s.title}
                className="h-full w-full object-cover"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <div className="border border-t-0 border-border p-7">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-navy"
                  strokeWidth={1.5}
                />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </SectionShell>
  );
}
