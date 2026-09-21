import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, CalendarCheck, UserPlus, Info } from "lucide-react";
import { api } from "@/lib/api";
import { PageTransition } from "@/components/motion/PageTransition";
import { Card, CardTitle } from "@/components/ui/card";

export function GrowthPage() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ["growth"],
    queryFn: async () => (await api.get("/dashboard/growth")).data,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-card bg-slate-200/80" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const months = (data?.last6Months ?? []) as { month: string; patients: number; appointments: number }[];
  const statusCounts = (data?.appointmentsByStatus ?? []) as { status: string; count: number }[];

  const totalAppts = statusCounts.reduce((sum, item) => sum + item.count, 0);

  // SVG Chart Calculations
  const chartHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const maxVal = Math.max(
    ...months.map((m) => Math.max(m.appointments, m.patients)),
    6 // minimum grid max scale
  );

  return (
    <PageTransition>
      <div className="space-y-8 pb-20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-card bg-primary/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clinic growth</h1>
            <p className="text-muted">Track patients, visits, and how your practice is performing.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={Users} label="Total patients" value={stats.totalPatients ?? 0} colorClass="text-teal-600 bg-teal-50" />
          <Metric icon={UserPlus} label="New this month" value={stats.newPatientsThisMonth ?? 0} colorClass="text-indigo-600 bg-indigo-50" />
          <Metric icon={CalendarCheck} label="Completed (month)" value={stats.completedThisMonth ?? 0} colorClass="text-emerald-600 bg-emerald-50" />
          <Metric icon={TrendingUp} label="Completion rate" value={`${stats.completionRate ?? 0}%`} colorClass="text-amber-600 bg-amber-50" />
        </div>

        <Card className="border border-border/80 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Appointments & Patient Trends</CardTitle>
              <p className="text-xs text-muted mt-1">Growth analysis over the last 6 months</p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                Appointments
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                New Patients
              </span>
            </div>
          </div>

          {months.length === 0 ? (
            <div className="mt-8 flex h-48 items-center justify-center rounded bg-slate-50 text-sm text-muted">
              No historical data available.
            </div>
          ) : (
            <div className="relative mt-6">
              <svg viewBox={`0 0 600 ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
                <defs>
                  <linearGradient id="gradient-appts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradient-patients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a962" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#c9a962" stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/* Y-Axis Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = paddingTop + (chartHeight - paddingTop - paddingBottom) * ratio;
                  const labelVal = Math.round(maxVal * (1 - ratio));
                  return (
                    <g key={ratio} className="opacity-40">
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={600 - paddingRight}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />
                      <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="fill-slate-400 font-sans font-medium text-[10px]">
                        {labelVal}
                      </text>
                    </g>
                  );
                })}

                {/* Draw Areas and Lines */}
                {(() => {
                  const graphWidth = 600 - paddingLeft - paddingRight;
                  const graphHeight = chartHeight - paddingTop - paddingBottom;
                  const pointsCount = months.length;
                  const stepX = graphWidth / (pointsCount - 1 || 1);

                  // Calculate Coordinates
                  const coords = months.map((m, idx) => {
                    const x = paddingLeft + idx * stepX;
                    const yAppt = paddingTop + graphHeight - (m.appointments / maxVal) * graphHeight;
                    const yPat = paddingTop + graphHeight - (m.patients / maxVal) * graphHeight;
                    return { x, yAppt, yPat, ...m };
                  });

                  // Build SVG Paths
                  const pathApptLine = coords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yAppt}`).join(" ");
                  const pathApptArea = `${pathApptLine} L ${coords[coords.length - 1].x} ${paddingTop + graphHeight} L ${coords[0].x} ${paddingTop + graphHeight} Z`;

                  const pathPatLine = coords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yPat}`).join(" ");
                  const pathPatArea = `${pathPatLine} L ${coords[coords.length - 1].x} ${paddingTop + graphHeight} L ${coords[0].x} ${paddingTop + graphHeight} Z`;

                  return (
                    <>
                      {/* Area Fills */}
                      <path d={pathApptArea} fill="url(#gradient-appts)" />
                      <path d={pathPatArea} fill="url(#gradient-patients)" />

                      {/* Stroke Lines */}
                      <path d={pathApptLine} fill="none" stroke="#0d9488" strokeWidth={2.5} strokeLinecap="round" />
                      <path d={pathPatLine} fill="none" stroke="#c9a962" strokeWidth={2.5} strokeLinecap="round" />

                      {/* Interactive Hover Vertical Guidelines & Nodes */}
                      {coords.map((p, idx) => (
                        <g
                          key={p.month}
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                          className="cursor-pointer"
                        >
                          {/* Invisible Wider Hover Area */}
                          <rect
                            x={p.x - stepX / 2}
                            y={paddingTop}
                            width={stepX}
                            height={graphHeight}
                            fill="transparent"
                          />

                          {/* Guide line */}
                          {hoveredIdx === idx && (
                            <line
                              x1={p.x}
                              y1={paddingTop}
                              x2={p.x}
                              y2={paddingTop + graphHeight}
                              stroke="#cbd5e1"
                              strokeWidth={1.5}
                            />
                          )}

                          {/* Data Circles */}
                          <circle
                            cx={p.x}
                            cy={p.yAppt}
                            r={hoveredIdx === idx ? 6 : 4}
                            fill="#0d9488"
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                          <circle
                            cx={p.x}
                            cy={p.yPat}
                            r={hoveredIdx === idx ? 6 : 4}
                            fill="#c9a962"
                            stroke="#ffffff"
                            strokeWidth={2}
                          />

                          {/* X-Axis Month Label */}
                          <text
                            x={p.x}
                            y={chartHeight - 12}
                            textAnchor="middle"
                            className={`font-sans font-medium text-[11px] ${
                              hoveredIdx === idx ? "fill-slate-900 font-semibold" : "fill-slate-400"
                            }`}
                          >
                            {p.month}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredIdx !== null && months[hoveredIdx] && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-4 rounded-xl border border-border bg-white px-4 py-2.5 shadow-md transition-all duration-200">
                  <div className="text-xs">
                    <span className="font-semibold text-foreground mr-1.5">{months[hoveredIdx].month}:</span>
                    <span className="text-teal-600 font-bold">{months[hoveredIdx].appointments}</span> appts
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <div className="text-xs">
                    <span className="text-accent font-bold">{months[hoveredIdx].patients}</span> new patients
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border border-border/80 shadow-soft">
            <CardTitle className="mb-2">Practice Pipeline</CardTitle>
            <p className="text-xs text-muted mb-4">Operations inventory status</p>
            <ul className="space-y-4">
              <PipelineItem label="Pending confirmations" value={stats.pendingCount ?? 0} description="Awaiting slot confirmation" />
              <PipelineItem label="Upcoming this week" value={stats.upcomingWeek ?? 0} description="Scheduled next 7 days" />
              <PipelineItem label="Active receptionists" value={stats.employeeCount ?? 0} description="Frontdesk desk members" />
              <PipelineItem label="Cancelled this month" value={stats.cancelledThisMonth ?? 0} description="Patient cancellation rate" />
            </ul>
          </Card>

          <Card className="border border-border/80 shadow-soft">
            <CardTitle className="mb-2">Appointments by Status</CardTitle>
            <p className="text-xs text-muted mb-4">Historical allocation percentages</p>
            <div className="space-y-4">
              {totalAppts === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Info className="h-5 w-5 text-slate-400" />
                  <p className="mt-2 text-xs text-muted">No appointments on record yet.</p>
                </div>
              ) : (
                ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => {
                  const match = statusCounts.find((s) => s.status === status);
                  const count = match?.count ?? 0;
                  const pct = totalAppts > 0 ? Math.round((count / totalAppts) * 100) : 0;
                  
                  // Color Mapping
                  const colorMap: Record<string, { fill: string; track: string }> = {
                    PENDING: { fill: "bg-amber-500", track: "bg-amber-100" },
                    CONFIRMED: { fill: "bg-indigo-500", track: "bg-indigo-100" },
                    COMPLETED: { fill: "bg-emerald-500", track: "bg-emerald-100" },
                    CANCELLED: { fill: "bg-rose-500", track: "bg-rose-100" },
                  };
                  const colors = colorMap[status] ?? { fill: "bg-slate-500", track: "bg-slate-100" };

                  return (
                    <div key={status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground capitalize">
                          {status.toLowerCase()}
                        </span>
                        <span className="text-muted font-medium">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full ${colors.track}`}>
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${colors.fill}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  colorClass = "text-primary bg-primary/10",
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  colorClass?: string;
}) {
  return (
    <Card className="group relative overflow-hidden p-5 border border-border/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground tracking-tight tabular-nums">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

function PipelineItem({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <li className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
      <div>
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="text-[10px] text-muted block mt-0.5">{description}</span>
      </div>
      <span className="text-lg font-bold text-foreground tabular-nums">{value}</span>
    </li>
  );
}
