import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CLINIC_LOGIN, PATIENT_LOGIN } from "@/lib/portal";

const emailSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z
  .object({
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

type Props = {
  portal: "patient" | "clinic";
};

export function ForgotPasswordPage({ portal }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loginPath = portal === "clinic" ? CLINIC_LOGIN : PATIENT_LOGIN;
  const title = portal === "clinic" ? "Reset clinic password" : "Reset your password";
  const subtitle =
    portal === "clinic"
      ? "Doctor and receptionist accounts"
      : "We'll send a code to your email";

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const sendOtp = async (data: EmailForm) => {
    setSending(true);
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setEmail(data.email);
      setStep("reset");
      toast.success("If the email exists, a reset code was sent.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not send reset code. Try again later.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const resetPassword = async (data: ResetForm) => {
    setResetting(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp: data.otp,
        password: data.password,
      });
      toast.success("Password updated. Sign in with your new password.");
      resetForm.reset();
      navigate(loginPath, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Invalid or expired code";
      toast.error(msg);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card className="border-border">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>

          {step === "email" ? (
            <form onSubmit={emailForm.handleSubmit(sendOtp)} className="mt-6 space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" {...emailForm.register("email")} />
                {emailForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-danger">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Sending..." : "Send reset code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(resetPassword)} className="mt-6 space-y-4">
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Code sent to <span className="font-medium">{email}</span>
              </p>
              <div>
                <Label>6-digit code</Label>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  {...resetForm.register("otp")}
                />
                {resetForm.formState.errors.otp && (
                  <p className="mt-1 text-xs text-danger">{resetForm.formState.errors.otp.message}</p>
                )}
              </div>
              <div>
                <Label>New password</Label>
                <Input type="password" {...resetForm.register("password")} />
                {resetForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-danger">
                    {resetForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Confirm password</Label>
                <Input type="password" {...resetForm.register("confirmPassword")} />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-danger">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={resetting}>
                {resetting ? "Updating..." : "Update password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={sending}
                onClick={() => sendOtp({ email })}
              >
                Resend code
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-muted">
            <Link to={loginPath} className="font-medium text-primary">
              Back to sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
