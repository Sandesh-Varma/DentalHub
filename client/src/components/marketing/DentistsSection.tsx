import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DoctorAvatar, type DoctorListItem } from "@/components/DoctorCard";
import { api } from "@/lib/api";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { SectionHeader, SectionShell } from "./SectionShell";
import { MagneticButton } from "./MagneticButton";

export function DentistsSection() {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => (await api.get<DoctorListItem[]>("/doctors")).data,
  });

  return (
    <SectionShell id="team">
      <SectionHeader
        eyebrow="Our specialists"
        title="Meet the clinicians behind your care"
        description="Every provider on our team is licensed, experienced, and committed to evidence-based dentistry delivered with empathy."
      />
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-border-subtle" />
          ))}
        </div>
      ) : doctors && doctors.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {doctors.map((d) => (
            <motion.article
              key={d.id}
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="group rounded-2xl border border-border bg-surface p-8 transition-shadow hover:shadow-[var(--shadow-card)]"
            >
              <DoctorAvatar doctor={d} className="h-20 w-20" />
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{d.user.name}</h3>
              <p className="mt-1 text-sm font-medium text-navy">{d.specialization}</p>
              {d.qualification && (
                <p className="mt-2 text-sm text-muted">{d.qualification}</p>
              )}
              {d.experience != null && (
                <p className="mt-1 text-sm text-muted">{d.experience} years in practice</p>
              )}
              {d.bio && (
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">{d.bio}</p>
              )}
            </motion.article>
          ))}
        </motion.div>
      ) : (
        <p className="text-muted">Provider profiles will appear here once configured.</p>
      )}
      <div className="mt-12 text-center">
        <MagneticButton to="/register">Schedule with a specialist</MagneticButton>
      </div>
    </SectionShell>
  );
}
