import { motion } from "framer-motion";
import { images } from "@/lib/images";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { SectionHeader, SectionShell } from "./SectionShell";

const highlights = [
  { title: "Private treatment suites", desc: "Sound-insulated rooms with natural light and ergonomic seating." },
  { title: "Sterilization protocols", desc: "Hospital-grade disinfection standards on every instrument, every visit." },
  { title: "Digital workflow", desc: "Paperless records, intraoral scanning, and same-day treatment previews." },
];

export function ClinicExperienceSection() {
  return (
    <SectionShell id="experience">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.div variants={fadeUp} className="col-span-2 overflow-hidden rounded-2xl">
            <img
              src={images.clinic}
              alt="DentFlow reception and waiting area"
              className="aspect-[16/10] w-full object-cover"
            />
          </motion.div>
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl">
            <img
              src={images.care}
              alt="Treatment room"
              className="aspect-square w-full object-cover"
            />
          </motion.div>
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl">
            <img
              src={images.team}
              alt="Clinical team"
              className="aspect-square w-full object-cover"
            />
          </motion.div>
        </motion.div>
        <div>
          <SectionHeader
            eyebrow="The clinic experience"
            title="A space designed for calm and confidence"
            description="From the moment you walk in, every detail — lighting, layout, technology — is intentional. Healthcare should feel considered, not clinical."
          />
          <ul className="space-y-6">
            {highlights.map((h, i) => (
              <motion.li
                key={h.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="border-l-2 border-accent pl-5"
              >
                <h3 className="font-semibold tracking-tight">{h.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{h.desc}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
