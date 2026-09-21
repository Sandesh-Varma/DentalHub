import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function TeamPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get("/employees")).data,
  });

  const createEmployee = useMutation({
    mutationFn: () => api.post("/employees", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Receptionist added to your team");
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", password: "" });
    },
    onError: () => toast.error("Could not add employee"),
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => api.patch(`/employees/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deactivated");
    },
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted">Add receptionists who manage patients and appointments.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>Add receptionist</Button>
      </div>

      {showForm && (
        <Card>
          <CardTitle>New receptionist</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["name", "Full name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["password", "Temporary password"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type={key === "password" ? "password" : "text"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <Button className="mt-4" onClick={() => createEmployee.mutate()}>
            Save employee
          </Button>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-sm text-muted">Loading team...</p>
        ) : (
          employees?.map(
            (e: {
              id: string;
              name: string;
              email: string;
              phone?: string;
              isActive: boolean;
            }) => (
              <Card key={e.id}>
                <CardTitle>{e.name}</CardTitle>
                <p className="text-sm text-primary">Receptionist</p>
                <p className="mt-2 text-sm text-muted">{e.email}</p>
                {e.phone && <p className="text-xs text-muted">{e.phone}</p>}
                {e.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => deactivate.mutate(e.id)}
                  >
                    Deactivate
                  </Button>
                )}
                {!e.isActive && (
                  <p className="mt-4 text-xs text-danger">Inactive</p>
                )}
              </Card>
            )
          )
        )}
        {!isLoading && !employees?.length && (
          <p className="text-sm text-muted">No employees yet. Add your front-desk receptionist.</p>
        )}
      </div>
    </div>
  );
}
