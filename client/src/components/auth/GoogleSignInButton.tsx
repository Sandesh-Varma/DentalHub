import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { homeForRole, isStaffRole } from "@/lib/portal";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

type Props = {
  portal: "patient" | "clinic";
};

export function GoogleSignInButton({ portal }: Props) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  if (!clientId) return null;

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error("Google sign-in failed");
      return;
    }
    try {
      const user = await loginWithGoogle(response.credential, portal);
      if (portal === "clinic") {
        if (!isStaffRole(user.role)) {
          toast.error("This Google account is not a clinic staff member");
          return;
        }
        toast.success("Welcome back");
        navigate(homeForRole(user.role), { replace: true });
        return;
      }
      if (isStaffRole(user.role)) {
        navigate(homeForRole(user.role), { replace: true });
        return;
      }
      toast.success("Welcome!");
      navigate(homeForRole(user.role), { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Google sign-in failed";
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-xs text-muted">or</span>
        </div>
      </div>
      <div className="mt-4 flex w-full justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => toast.error("Google sign-in failed")}
          useOneTap={false}
          theme="outline"
          size="large"
          shape="rectangular"
          text="continue_with"
          width={320}
        />
      </div>
    </div>
  );
}

export function isGoogleSignInEnabled() {
  return !!clientId;
}
