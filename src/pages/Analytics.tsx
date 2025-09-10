import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { TrendingUp, Users, Target, Zap, Archive, RefreshCw, XCircle, CheckCircle2 } from "lucide-react";
import React, { useMemo } from 'react';
import { useApplications } from '../hooks/useApplications';
import Papa from 'papaparse';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area,
  PieChart, Pie, Cell, BarChart, Bar, ScatterChart, Scatter
} from 'recharts';
import { TripleToggle } from '@/components/ui/triple-toggle';
import { useNavigate } from 'react-router-dom';

export default function Analytics() {
  const navigate = useNavigate();
  // Applications data for charts
  const { data: applications, isLoading } = useApplications();
  const activeApps = useMemo(() =>
    applications.filter(app => !app.is_archive),
    [applications]
  );

  // Toggle state for Applications Over Time
  const [timeView, setTimeView] = React.useState<'days' | 'weeks' | 'months'>('weeks');

  // Applications Over Time data logic
  const applicationsOverTime = useMemo(() => {
    if (timeView === 'days') {
      // Last 8 days
      const days: { date: Date }[] = [];
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        days.push({ date: d });
      }
      return days.map(({ date }) => {
        const count = activeApps.filter(app => {
          const applied = new Date(app.date_applied);
          applied.setHours(0, 0, 0, 0);
          return applied.getTime() === date.getTime();
        }).length;
        const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return { x: label, count };
      });
    } else if (timeView === 'months') {
      // Last 8 months
      const months: { year: number, month: number }[] = [];
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth() });
      }
      return months.map(({ year, month }) => {
        const count = activeApps.filter(app => {
          const applied = new Date(app.date_applied);
          return applied.getFullYear() === year && applied.getMonth() === month;
        }).length;
        const label = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        return { x: label, count };
      });
    } else {
      // Weeks (default, last 8 weeks, Monday-Sunday)
      function getMonday(d: Date) {
        const date = new Date(d);
        const day = date.getDay();
        const diff = (day === 0 ? -6 : 1) - day;
        date.setDate(date.getDate() + diff);
        date.setHours(0, 0, 0, 0);
        return date;
      }
      const now = new Date();
      const weeks: { start: Date; end: Date }[] = [];
      let currentMonday = getMonday(now);
      for (let i = 0; i < 8; i++) {
        const weekStart = new Date(currentMonday);
        const weekEnd = new Date(currentMonday);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weeks.unshift({ start: new Date(weekStart), end: new Date(weekEnd) });
        currentMonday.setDate(currentMonday.getDate() - 7);
      }
      return weeks.map(({ start, end }) => {
        const count = activeApps.filter(app => {
          const applied = new Date(app.date_applied);
          applied.setHours(0, 0, 0, 0);
          return applied >= start && applied <= end;
        }).length;
        const label = `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}–${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        return { x: label, count };
      });
    }
  }, [activeApps, timeView]);

  // Status Distribution data for donut chart
  const statusColors: Record<string, string> = {
    Applied: '#6B7280',
    'Phone Screen': '#F59E0B',
    Interview: '#00FFFF',
    Offer: '#10B981',
    Rejected: '#EF4444',
  };
  const statusOrder = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'];
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const status of statusOrder) counts[status] = 0;
    activeApps.forEach(app => {
      const status = statusOrder.find(s => app.status.toLowerCase() === s.toLowerCase()) || app.status;
      counts[status] = (counts[status] || 0) + 1;
    });
    return statusOrder.map(status => ({ name: status, value: counts[status], color: statusColors[status] }));
  }, [activeApps]);

  // Color helpers
  const green = 'text-green-500';
  const red = 'text-red-500';
  const gray = 'text-muted-foreground';

  // Applications by Platform data
  const platformData = useMemo(() => {
    const counts: Record<string, number> = {};
    activeApps.forEach(app => {
      const platform = app.platform?.trim() || 'Unknown';
      counts[platform] = (counts[platform] || 0) + 1;
    });
    // Sort platforms by count desc
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top5 = sorted.slice(0, 5);
    const othersCount = sorted.slice(5).reduce((sum, [, count]) => sum + count, 0);
    const data = top5.map(([name, applications]) => ({ name, applications }));
    if (othersCount > 0) {
      data.push({ name: 'Others', applications: othersCount });
    }
    return data;
  }, [activeApps]);

  // Job Type Distribution data for pie chart
  const typeColors: Record<string, string> = {
    'full-time': '#134e4a', // dark teal
    'part-time': '#2dd4bf', // medium teal
    'internship': '#cbd5e1', // lightest (same as before)
  };
  const typeLabels: Record<string, string> = {
    'full-time': 'Full-Time',
    'part-time': 'Part-Time',
    'internship': 'Internship',
  };
  const typeOrder = ['full-time', 'part-time', 'internship'];
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { 'full-time': 0, 'part-time': 0, 'internship': 0 };
    activeApps.forEach(app => {
      const type = (app.type || '').toLowerCase();
      if (type in counts) counts[type]++;
    });
    return typeOrder.map(type => ({ name: typeLabels[type], value: counts[type], color: typeColors[type] }));
  }, [activeApps]);

  const handleExport = () => {
    const dataToExport = applications.map(app => ({
      "Date Applied": app.date_applied,
      "Title": app.title,
      "Company": app.company,
      "Status": app.status,
      "Type": app.type,
      "Salary": app.salary,
      "Location": app.location,
      "Remote": app.is_remote,
      "Platform": app.platform,
      "Follow Up Date": app.follow_up,
      "Referral": app.referral,
      "HR Contact": app.hr_contact,
      "Notes": app.notes,
      "Description": app.description,
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'job_applications.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col space-y-6 w-full p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Analytics
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-transparent rounded-full mt-2"></div>
          </h1>
          <p className="text-muted-foreground">Insights into your job search performance</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="border-border/50 hover:border-primary/50 w-full sm:w-auto" onClick={handleExport}>
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Stat Cards: 2x4 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(() => {
          // Calculations
          const totalActive = activeApps.length;
          const processing = activeApps.filter(app => {
            const s = app.status.toLowerCase();
            return s === 'applied' || s === 'phone screen';
          }).length;
          const interviews = activeApps.filter(app => app.status.toLowerCase() === 'interview').length;
          const offers = activeApps.filter(app => app.status.toLowerCase() === 'offer').length;
          const responded = activeApps.filter(app => app.status.toLowerCase() !== 'applied').length;
          const responseRate = totalActive > 0 ? Math.round((responded / totalActive) * 100) : 0;
          const offerRate = (offers + interviews) > 0 ? Math.round((offers / (offers + interviews)) * 100) : 0;
          const rejections = activeApps.filter(app => app.status.toLowerCase() === 'rejected').length;
          const rejectionRate = totalActive > 0 ? Math.round((rejections / totalActive) * 100) : 0;
          const archived = applications.filter(app => app.is_archive).length;
          // Card data
          const stats = [
            {
              label: "Total Applications",
              value: totalActive,
              icon: Target,
              color: "primary",
              glow: "glow-teal"
            },
            {
              label: "Processing Applications",
              value: processing,
              icon: RefreshCw,
              color: "secondary",
              glow: "glow-orange"
            },
            {
              label: "Interviews",
              value: interviews,
              icon: Users,
              color: "primary",
              glow: "glow-teal"
            },
            {
              label: "Offers",
              value: offers,
              icon: CheckCircle2,
              color: green,
              glow: "glow-teal"
            },
            {
              label: "Response Rate",
              value: `${responseRate}%`,
              icon: TrendingUp,
              color: "primary",
              glow: "glow-teal"
            },
            {
              label: "Offer Rate",
              value: `${offerRate}%`,
              icon: Zap,
              color: green,
              glow: "glow-teal"
            },
            {
              label: "Rejection Rate",
              value: `${rejectionRate}%`,
              icon: XCircle,
              color: red,
              glow: "glow-orange"
            },
            {
              label: "Archived Applications",
              value: archived,
              icon: Archive,
              color: gray,
              glow: ""
            },
          ];
          return stats.map((stat, index) => {
            const isTotalApplications = stat.label === 'Total Applications';
            return (
              <Card
                key={index}
                className={`gradient-card border-border/50 shadow-elegant hover:shadow-lg transition-all duration-300 hover:${stat.glow} transform transition-transform hover:scale-105 ${isTotalApplications ? 'cursor-pointer' : ''}`}
                onClick={isTotalApplications ? () => navigate('/applications') : undefined}
                tabIndex={isTotalApplications ? 0 : undefined}
                role={isTotalApplications ? 'button' : undefined}
                aria-label={isTotalApplications ? 'View all applications' : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${
                      stat.color === green ? 'bg-green-100/20 border-green-200' :
                      stat.color === red ? 'bg-red-100/20 border-red-200' :
                      stat.color === gray ? 'bg-muted border-border' :
                      `bg-${stat.color}/10 border-${stat.color}/20`
                    }`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          });
        })()}
      </div>

      {activeApps.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-background/80 shadow-elegant p-8 min-h-[300px] flex flex-col items-center justify-center text-muted-foreground text-lg font-medium">
          No active applications to analyze yet. Add some applications to see analytics!
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-background/80 shadow-elegant p-8 min-h-[300px] flex flex-col items-center justify-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications Over Time Chart */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-foreground mb-6">Applications Over Time</h2>
                <TripleToggle
                  labels={["Days", "Weeks", "Months"]}
                  value={timeView === 'days' ? 'left' : timeView === 'weeks' ? 'center' : 'right'}
                  onChange={v => setTimeView(v === 'left' ? 'days' : v === 'center' ? 'weeks' : 'months')}
                />
              </div>
              <div className="h-80 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-2xl flex items-center justify-center border border-border/30 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={applicationsOverTime} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00FFFF" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} fontSize={12} angle={-20} textAnchor="end" interval={0} height={50} />
                    <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} fontSize={12} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const { count } = payload[0].payload;
                          return (
                            <div style={{ background: 'rgba(20,20,20,0.85)', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13, minWidth: 90, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                              <div style={{ fontWeight: 600, marginBottom: 2 }}>{payload[0].payload.x}</div>
                              <div style={{ fontSize: 12 }}>{count} application{count === 1 ? '' : 's'}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#00FFFF" fill="url(#tealGradient)" strokeWidth={0} dot={false} activeDot={false} />
                    <Line type="monotone" dataKey="count" stroke="#00FFFF" strokeWidth={3} dot={{ r: 5, fill: '#00FFFF', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Status Distribution Chart */}
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-foreground mb-8">Status Distribution</h2>
              <div className="h-80 bg-gradient-to-br from-secondary/10 via-secondary/5 to-primary/10 rounded-2xl flex flex-col items-center justify-center border border-border/30 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusCounts}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {statusCounts.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const { name, value, color } = payload[0].payload;
                          return (
                            <div style={{ background: 'rgba(20,20,20,0.85)', color: '#fff', borderRadius: 8, padding: '8px 14px', minWidth: 90, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 14, height: 14, borderRadius: 4, background: color, marginRight: 8, border: '1px solid #222' }} />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                                <div style={{ fontSize: 12 }}>{value} application{value === 1 ? '' : 's'}</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                  {statusCounts.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                      <span className="text-xs text-foreground font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeApps.length === 0 ? (
        <div className="w-full rounded-2xl border border-border/50 bg-background shadow-elegant p-8 mb-8 flex items-center justify-center text-muted-foreground text-lg font-medium min-h-[300px]">
          No job type or platform data to display yet. Add some applications to see these analytics!
        </div>
      ) : (
        <div className="w-full rounded-2xl border border-border/50 bg-background shadow-elegant p-8 mb-8">
          {/* Charts row, two small gradient cards */}
          <div className="w-full flex flex-col lg:flex-row gap-8">
            {/* Job Type Distribution Donut Chart */}
            <div className="w-full lg:w-2/5 flex flex-col items-center justify-center mb-8 lg:mb-0">
              <h2 className="text-2xl font-bold text-foreground w-full text-left py-4">Job Type Distribution</h2>
              <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 shadow-elegant p-6 h-80 w-full flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PieChart width={360} height={288}>
                      <Pie
                        data={typeCounts}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {typeCounts.map((entry, idx) => (
                          <Cell key={`cell-type-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const { name, value, color } = payload[0].payload;
                            return (
                              <div style={{ background: 'rgba(20,20,20,0.85)', color: '#fff', borderRadius: 8, padding: '8px 14px', minWidth: 90, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 14, height: 14, borderRadius: 4, background: color, marginRight: 8, border: '1px solid #222' }} />
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                                  <div style={{ fontSize: 12 }}>{value} application{value === 1 ? '' : 's'}</div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                    <div className="flex flex-wrap gap-4 mt-4 justify-center">
                      {typeCounts.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                          <span className="text-xs text-foreground font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Applications by Platform Bar Chart */}
            <div className="w-full lg:w-3/5 flex flex-col items-center justify-center lg:items-start">
              <h2 className="text-2xl font-bold text-foreground text-left py-4 w-full">Applications by Platform</h2>
              <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 shadow-elegant p-6 h-80 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} layout="vertical" margin={{ left: 20, right: 40, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={13} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={14} width={120} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const { name, applications } = payload[0].payload;
                          return (
                            <div style={{ background: 'rgba(20,20,20,0.85)', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13, minWidth: 90, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                              <div style={{ fontWeight: 600, marginBottom: 2 }}>{name}</div>
                              <div style={{ fontSize: 12 }}>{applications} application{applications === 1 ? '' : 's'}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="applications" fill="#00FFFF" radius={[0, 8, 8, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Analytics Section: Heat Map, Bubble Chart, Table */}
      {activeApps.length === 0 ? null : (
        <div className="w-full rounded-2xl border border-border/50 bg-background shadow-elegant p-8 mb-8">
          <div className="w-full flex flex-col lg:flex-row gap-12 justify-between">
            {/* Heat Map for Top Locations */}
            <div className="flex-1 flex flex-col items-start justify-center">
              <h2 className="text-xl font-bold text-foreground w-full text-left mb-2">Top Locations</h2>
              {(() => {
                // Aggregate top 6 locations
                const locationCounts: Record<string, number> = {};
                activeApps.forEach(app => {
                  const loc = (app.location || 'Unknown').trim();
                  locationCounts[loc] = (locationCounts[loc] || 0) + 1;
                });
                const sorted = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);
                const topLocations = sorted.slice(0, 6);
                // 5 visually distinct teal gradients (light to dark)
                const gradients = [
                  '#e0f7fa', // 1: lightest (cyan-50)
                  '#80deea', // 2: light (cyan-200)
                  '#26c6da', // 3: medium (cyan-400)
                  '#00838f', // 4: dark (cyan-800)
                  '#134e4a', // 5+: darkest (teal-900)
                ];
                function getCellColor(count: number) {
                  if (count >= 5) return gradients[4];
                  if (count === 4) return gradients[3];
                  if (count === 3) return gradients[2];
                  if (count === 2) return gradients[1];
                  return gradients[0];
                }
                // Fill up to 6 cells for 2x3 grid
                const gridCells = Array.from({ length: 6 }, (_, i) => topLocations[i] || [null, null]);
                return (
                  <div className="w-full flex flex-col items-start">
                    <div className="grid grid-cols-3 grid-rows-2 gap-2 w-full max-w-[420px]">
                      {gridCells.map(([loc, count], idx) => {
                        // Only show first part before comma (city)
                        const city = loc ? String(loc).split(',')[0].trim() : '';
                        return (
                          <div
                            key={loc || idx}
                            className={`flex flex-col items-center justify-end rounded-lg shadow-sm border border-border/40 p-2 min-h-[70px] min-w-[90px] w-full transition-all ${loc ? 'hover:scale-105 cursor-pointer' : 'opacity-40'} bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10`}
                            style={{ background: loc ? getCellColor(count as number) : '#f3f4f6' }}
                            title={loc ? `${loc}: ${count} application${count === 1 ? '' : 's'}` : ''}
                          >
                            <span className="text-xs font-semibold text-foreground mb-1 truncate w-full text-center">{city}</span>
                            <span className="text-lg font-bold text-foreground">{loc ? count : ''}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-row gap-3 mt-3">
                      <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#e0f7fa] border border-border/30 inline-block"></span><span className="text-xs text-muted-foreground">1</span></div>
                      <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#80deea] border border-border/30 inline-block"></span><span className="text-xs text-muted-foreground">2</span></div>
                      <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#26c6da] border border-border/30 inline-block"></span><span className="text-xs text-muted-foreground">3</span></div>
                      <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#00838f] border border-border/30 inline-block"></span><span className="text-xs text-muted-foreground">4</span></div>
                      <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#134e4a] border border-border/30 inline-block"></span><span className="text-xs text-muted-foreground">5+</span></div>
                    </div>
                  </div>
                );
              })()}
            </div>
            {/* Table for Top 5 Companies */}
            <div className="flex-1 flex flex-col items-start justify-center ml-0 lg:ml-8 mr-0 lg:mr-8">
              <h2 className="text-xl font-bold text-foreground w-full text-left mb-2">Top Companies</h2>
              {(() => {
                // Aggregate top 5 companies
                const companyCounts: Record<string, number> = {};
                activeApps.forEach(app => {
                  const company = (app.company || 'Unknown').trim();
                  companyCounts[company] = (companyCounts[company] || 0) + 1;
                });
                const sorted = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]);
                const topCompanies = sorted.slice(0, 5);
                return (
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-[180px] w-full text-sm border-separate border-spacing-y-2">
                      <thead>
                        <tr>
                          <th className="text-left text-muted-foreground font-semibold">Company</th>
                          <th className="text-right text-muted-foreground font-semibold">Applications</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCompanies.map(([company, count]) => (
                          <tr key={company} className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                            <td className="py-2 px-3 rounded-l-lg text-foreground font-medium">{company}</td>
                            <td className="py-2 px-3 rounded-r-lg text-right text-foreground font-bold">{count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
            {/* Table for Top 5 Job Titles */}
            <div className="flex-1 flex flex-col items-start justify-center">
              <h2 className="text-xl font-bold text-foreground w-full text-left mb-2">Top Job Titles</h2>
              {(() => {
                // Aggregate top 5 job titles
                const titleCounts: Record<string, number> = {};
                activeApps.forEach(app => {
                  const title = (app.title || 'Unknown').trim();
                  titleCounts[title] = (titleCounts[title] || 0) + 1;
                });
                const sorted = Object.entries(titleCounts).sort((a, b) => b[1] - a[1]);
                const topTitles = sorted.slice(0, 5);
                return (
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-[180px] w-full text-sm border-separate border-spacing-y-2">
                      <thead>
                        <tr>
                          <th className="text-left text-muted-foreground font-semibold">Job Title</th>
                          <th className="text-right text-muted-foreground font-semibold">Applications</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topTitles.map(([title, count]) => (
                          <tr key={title} className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                            <td className="py-2 px-3 rounded-l-lg text-foreground font-medium">{title}</td>
                            <td className="py-2 px-3 rounded-r-lg text-right text-foreground font-bold">{count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
