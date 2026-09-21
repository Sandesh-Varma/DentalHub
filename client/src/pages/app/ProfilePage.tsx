import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type ProfileForm = {
  name: string;
  phone: string;
  address: string;
  emergencyContact: string;
};

export function ProfilePage() {
  const queryClient = useQueryClient();

  const { data: patient, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["patient-me"],
    queryFn: async () => (await api.get("/patients/me")).data,
    retry: 1,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileForm>({
    defaultValues: { name: "", phone: "", address: "", emergencyContact: "" },
  });

  useEffect(() => {
    if (!patient?.user) return;
    reset({
      name: patient.user.name ?? "",
      phone: patient.user.phone ?? "",
      address: patient.address ?? "",
      emergencyContact: patient.emergencyContact ?? "",
    });
  }, [patient, reset]);

  const update = useMutation({
    mutationFn: (payload: ProfileForm) => api.patch("/patients/me", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-me"] });
      toast.success("Profile saved");
    },
    onError: () => toast.error("Could not save profile"),
  });

  if (isLoading) {
    return <p className="text-sm text-muted">Loading profile…</p>;
  }

  if (isError) {
    const message = isAxiosError(error)
      ? (error.response?.data as { message?: string })?.message ?? error.message
      : "Something went wrong";
    return (
      <Card className="border-border p-6">
        <p className="text-sm text-danger">{message}</p>
        <Button className="mt-4" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted">{patient?.user?.email}</p>
      </div>

      <Card className="border-border">
        <CardTitle>Personal details</CardTitle>
        <form
          className="mt-5 space-y-4"
          onSubmit={handleSubmit((data) => update.mutate(data))}
        >
          <div>
            <Label>Full name</Label>
            <Input {...register("name", { required: true, minLength: 2 })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register("phone")} />
          </div>
          <div>
            <Label>Address</Label>
            <Input {...register("address")} />
          </div>
          <div>
            <Label>Emergency contact</Label>
            <Input {...register("emergencyContact")} placeholder="Name and phone" />
          </div>
          <Button type="submit" disabled={isSubmitting || update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
