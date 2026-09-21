import { Card, CardTitle } from "@/components/ui/card";
import { mediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";
import { Stethoscope } from "lucide-react";

export type DoctorListItem = {
  id: string;
  specialization: string;
  qualification?: string | null;
  experience?: number | null;
  bio?: string | null;
  clinicName?: string | null;
  profileImage?: string | null;
  user: { name: string };
};

export function DoctorAvatar({
  doctor,
  className,
}: {
  doctor: Pick<DoctorListItem, "profileImage" | "user">;
  className?: string;
}) {
  const src = mediaUrl(doctor.profileImage);
  return (
    <div
      className={cn(
        "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10",
        className
      )}
    >
      {src ? (
        <img src={src} alt={doctor.user.name} className="h-full w-full object-cover" />
      ) : (
        <Stethoscope className="h-7 w-7 text-primary" />
      )}
    </div>
  );
}

export function DoctorSelectCard({
  doctor,
  selected,
  onSelect,
}: {
  doctor: DoctorListItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer border-border transition-colors",
        selected && "border-primary ring-1 ring-primary"
      )}
      onClick={onSelect}
    >
      <div className="flex gap-4">
        <DoctorAvatar doctor={doctor} />
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base">{doctor.user.name}</CardTitle>
          <p className="text-sm font-medium text-primary">{doctor.specialization}</p>
          {doctor.clinicName && (
            <p className="mt-0.5 text-xs text-muted">{doctor.clinicName}</p>
          )}
          {doctor.qualification && (
            <p className="mt-1 text-xs text-muted">{doctor.qualification}</p>
          )}
          {doctor.experience != null && (
            <p className="text-xs text-muted">{doctor.experience} years experience</p>
          )}
          {doctor.bio && (
            <p className="mt-2 line-clamp-2 text-xs text-muted">{doctor.bio}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
