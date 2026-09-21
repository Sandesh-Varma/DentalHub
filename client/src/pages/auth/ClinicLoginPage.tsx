import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { homeForRole, isStaffRole } from "@/lib/portal";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export function ClinicLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      if (!isStaffRole(user.role)) {
        navigate(homeForRole(user.role), { replace: true });
        return;
      }
      toast.success("Welcome back");
      navigate(homeForRole(user.role), { replace: true });
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-white/20 bg-white/95 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-bold text-foreground">Practice sign in</h1>
        <p className="mt-1 text-sm text-muted">Doctor and receptionist access.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label>Work email</Label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Password</Label>
              <Link to="/clinic/forgot-password" className="text-xs font-medium text-primary">
                Forgot password?
              </Link>
            </div>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Enter clinic dashboard"}
          </Button>
        </form>
        <div className="mt-4">
          <GoogleSignInButton portal="clinic" />
        </div>
      </Card>
    </motion.div>
  );
}
