import { motion } from "framer-motion";
import { Mail, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { fadeUp } from "@/lib/motion";

const details = [
  { icon: Mail, label: "Email", value: "hello@dentflow.com" },
  { icon: Clock, label: "Hours", value: "Monday – Saturday, 9:00 – 18:00" },
  { icon: MapPin, label: "Location", value: "1240 Westlake Avenue, Suite 200" },
];

export function ContactPage() {
  return (
    <div className="section-pad">
      <div className="container-marketing">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Contact
          </p>
          <h1 className="heading-section mt-4">We&apos;re here to help</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Questions about booking, insurance, or your account? Reach out — our team
            responds within one business day.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-12 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            {details.map((d, i) => (
              <motion.div
                key={d.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                className="flex gap-4 rounded-xl border border-border bg-surface p-5"
              >
                <d.icon className="mt-0.5 h-5 w-5 shrink-0 text-navy" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-foreground">{d.label}</p>
                  <p className="mt-1 text-sm text-muted">{d.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="rounded-2xl border border-border bg-surface p-8 lg:col-span-3"
          >
            <h2 className="text-lg font-semibold tracking-tight">Send a message</h2>
            <form
              className="mt-6 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input placeholder="Your name" className="mt-1.5" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@email.com" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea placeholder="How can we help?" rows={5} className="mt-1.5" />
              </div>
              <Button type="submit" className="bg-navy hover:bg-navy-mid">
                Send message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
