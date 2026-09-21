import { motion, useMotionValue, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  to?: string;
  href?: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  onClick?: () => void;
};

export function MagneticButton({
  to,
  href,
  children,
  variant = "primary",
  className,
  onClick,
}: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const variants = {
    primary: "bg-navy text-white hover:bg-navy-mid shadow-[var(--shadow-card)]",
    outline:
      "border border-border bg-surface text-foreground hover:border-navy/30 hover:bg-background",
    ghost: "text-foreground hover:bg-border-subtle",
  };

  const classes = cn(
    "relative inline-flex items-center justify-center gap-2 rounded-[10px] px-6 py-3.5 text-sm font-medium transition-colors",
    variants[variant],
    className
  );

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.15);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.15);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const motionProps = {
    style: { x: springX, y: springY },
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    whileTap: { scale: 0.98 },
    className: classes,
  };

  if (to) {
    return (
      <Link to={to} onClick={onClick}>
        <motion.span {...motionProps}>{children}</motion.span>
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} onClick={onClick}>
        <motion.span {...motionProps}>{children}</motion.span>
      </a>
    );
  }

  return (
    <motion.button type="button" onClick={onClick} {...motionProps}>
      {children}
    </motion.button>
  );
}
