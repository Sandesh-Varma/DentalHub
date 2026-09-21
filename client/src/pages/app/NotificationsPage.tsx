import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/patient/EmptyState";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationsPage() {
  const { user } = useAuth();
  const isPatient = user?.role === "PATIENT";
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Marked all as read");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className={cn("space-y-6", isPatient && "pb-20 md:pb-0")}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          {data?.unreadCount > 0 && (
            <p className="mt-1 text-sm text-muted">{data.unreadCount} unread</p>
          )}
        </div>
        {(data?.unreadCount ?? 0) > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : !data?.notifications?.length ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="Updates about your appointments will appear here."
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {data.notifications.map(
            (n: {
              id: string;
              title: string;
              message: string;
              isRead: boolean;
              createdAt: string;
            }) => (
              <li
                key={n.id}
                className={cn("px-4 py-4", !n.isRead && "bg-slate-50")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">{n.title}</p>
                    <p className="mt-1 text-sm text-muted">{n.message}</p>
                    <p className="mt-2 text-xs text-muted">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!n.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => markRead.mutate(n.id)}
                      >
                        Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-muted"
                      onClick={() => remove.mutate(n.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
