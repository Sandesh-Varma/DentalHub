import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { mediaUrl } from "@/lib/mediaUrl";
import { useAuth } from "@/context/AuthContext";
import { DoctorAvatar } from "@/components/DoctorCard";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

type DoctorProfile = {
  id: string;
  specialization: string;
  qualification?: string | null;
  experience?: number | null;
  bio?: string | null;
  clinicName?: string | null;
  address?: string | null;
  profileImage?: string | null;
  user: { name: string; email: string; phone?: string | null };
};

export function DoctorProfilePage() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imagePayload, setImagePayload] = useState<string | null | undefined>(undefined);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    bio: "",
    clinicName: "",
    address: "",
  });

  const { data: doctor, isLoading } = useQuery({
    queryKey: ["doctor-me"],
    queryFn: async () => (await api.get<DoctorProfile>("/doctors/me")).data,
  });

  useEffect(() => {
    if (!doctor) return;
    setForm({
      name: doctor.user.name,
      phone: doctor.user.phone ?? "",
      specialization: doctor.specialization,
      qualification: doctor.qualification ?? "",
      experience: doctor.experience?.toString() ?? "",
      bio: doctor.bio ?? "",
      clinicName: doctor.clinicName ?? "",
      address: doctor.address ?? "",
    });
    setPreview(mediaUrl(doctor.profileImage));
    setImagePayload(undefined);
  }, [doctor]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        name: form.name,
        phone: form.phone || null,
        specialization: form.specialization,
        qualification: form.qualification || null,
        experience: form.experience ? Number(form.experience) : null,
        bio: form.bio || null,
        clinicName: form.clinicName || null,
        address: form.address || null,
      };
      if (imagePayload !== undefined) {
        if (imagePayload === null) payload.removeProfileImage = true;
        else payload.profileImage = imagePayload;
      }
      return api.patch("/doctors/me", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doctor-me"] });
      await queryClient.invalidateQueries({ queryKey: ["doctors"] });
      await refreshUser();
      toast.success("Profile saved — patients will see your updated details");
      setImagePayload(undefined);
    },
    onError: () => toast.error("Could not save profile"),
  });

  const onFileChange = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setImagePayload(result);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return <p className="text-muted">Loading profile...</p>;
  }

  if (!doctor) {
    return (
      <p className="text-muted">
        No doctor profile linked. Contact support or re-run database seed.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Your profile</h1>
        <p className="text-muted">
          This is what patients see when they choose a dentist to book. Keep your photo and
          details up to date.
        </p>
      </div>

      <Card>
          <CardTitle>Photo</CardTitle>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <DoctorAvatar
              doctor={{
                profileImage: preview ?? doctor.profileImage,
                user: { name: form.name || doctor.user.name },
              }}
              className="h-24 w-24"
            />
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0])}
              />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                Upload photo
              </Button>
              {(preview || doctor.profileImage) && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-danger"
                  onClick={() => {
                    setPreview(null);
                    setImagePayload(null);
                  }}
                >
                  Remove photo
                </Button>
              )}
              <p className="text-xs text-muted">JPEG, PNG or WebP. Max 2MB.</p>
            </div>
          </div>
        </Card>

      <Card>
        <CardTitle>Personal & practice</CardTitle>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Full name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={doctor.user.email} disabled className="bg-slate-50" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Clinic / practice name</Label>
              <Input
                value={form.clinicName}
                onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                placeholder="e.g. Smile Studio Dental"
              />
            </div>
            <div>
              <Label>Clinic address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>
        </Card>

      <Card>
        <CardTitle>Professional details</CardTitle>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Specialization</Label>
              <Input
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              />
            </div>
            <div>
              <Label>Qualification</Label>
              <Input
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                placeholder="e.g. DDS, BDS"
              />
            </div>
            <div>
              <Label>Years of experience</Label>
              <Input
                type="number"
                min={0}
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
              />
            </div>
            <div>
              <Label>About you</Label>
              <Textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Short intro patients see when booking..."
              />
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </Card>
    </div>
  );
}
