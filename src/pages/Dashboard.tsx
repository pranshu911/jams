import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Calendar, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApplications } from '../hooks/useApplications';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area,
  PieChart, Pie, Cell, Legend
} from 'recharts';

function getDaysAgo(dateString: string) {
  const now = new Date();
  const applied = new Date(dateString);
  const diff = Math.floor((now.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Applied":
      return "bg-muted text-muted-foreground border-border";
    case "Phone Screen":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Interview":
      return "bg-primary/20 text-primary border-primary/30";
    case "Offer":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export default function Dashboard() {
  const { data: applications, isLoading } = useApplications();
  const navigate = useNavigate();

  // Only active (non-archived) applications
  const activeApps = useMemo(() =>
    applications.filter(app => !app.is_archive),
    [applications]
  );

  // Stats
  const totalApplications = activeApps.length;
  const interviewsScheduled = activeApps.filter(app => app.status.toLowerCase() === 'interview').length;
  const offersReceived = activeApps.filter(app => app.status.toLowerCase() === 'offer').length;
  const respondedCount = activeApps.filter(app => app.status.toLowerCase() !== 'applied').length;
  const responseRate = totalApplications > 0 ? Math.round((respondedCount / totalApplications) * 100) : 0;

  const stats = [
    {
      title: "Total Applications",
      value: totalApplications,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/20",
      glowClass: "hover:glow-teal",
    },
    {
      title: "Interviews Scheduled",
      value: interviewsScheduled,
      icon: Calendar,
      color: "text-secondary",
      bgColor: "bg-secondary/20",
      glowClass: "hover:glow-orange",
    },
    {
      title: "Offers Received",
      value: offersReceived,
      icon: Users,
      color: "text-green-400",
      bgColor: "bg-green-400/20",
    },
    {
      title: "Response Rate",
      value: `${responseRate}%`,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-400/20",
    },
  ];

  // Recent Applications: top 5 by date_applied (descending)
  const recentApplications = useMemo(() => {
    return activeApps
      .slice()
      .sort((a, b) => new Date(b.date_applied).getTime() - new Date(a.date_applied).getTime())
      .slice(0, 5);
  }, [activeApps]);

  // Applications Over Time: last 8 weeks (Monday-Sunday)
  const applicationsOverTime = useMemo(() => {
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
    const weekData = weeks.map(({ start, end }) => {
      const count = activeApps.filter(app => {
        const applied = new Date(app.date_applied);
        applied.setHours(0, 0, 0, 0);
        return applied >= start && applied <= end;
      }).length;
      const label = `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}–${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
      return { week: label, count };
    });
    return weekData;
  }, [activeApps]);

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

  return (
    <div className="space-y-8 w-full">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your application overview.</p>
        </div>
        <Link to="/applications/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-teal">
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse gradient-card border-border/50 shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-24 bg-muted rounded mb-2" />
                    <div className="h-8 w-16 bg-muted rounded" />
                  </div>
                  <div className="h-12 w-12 bg-muted rounded-2xl" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat) => {
            const isTotalApplications = stat.title === 'Total Applications';
            return (
              <Card
                key={stat.title}
                className={`gradient-card border-border/50 shadow-elegant transition-all duration-300 hover:shadow-2xl hover:scale-105 ${stat.glowClass || ''} ${isTotalApplications ? 'cursor-pointer' : ''}`}
                onClick={isTotalApplications ? () => navigate('/applications') : undefined}
                tabIndex={isTotalApplications ? 0 : undefined}
                role={isTotalApplications ? 'button' : undefined}
                aria-label={isTotalApplications ? 'View all applications' : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${stat.bgColor} backdrop-blur-sm`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Charts Section */}
      {activeApps.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3 gradient-card border-border/50 shadow-elegant flex items-center justify-center min-h-[320px]">
            <CardContent className="flex items-center justify-center w-full h-full text-muted-foreground text-lg font-medium">
              No active applications to analyze yet. Add some applications to see analytics!
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-foreground">Applications Over Time</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} fontSize={12} angle={-20} textAnchor="end" interval={0} height={50} />
                    <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} fontSize={12} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const { count } = payload[0].payload;
                          return (
                            <div style={{ background: 'rgba(20,20,20,0.85)', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13, minWidth: 90, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                              <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
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
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-foreground">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Applications */}
      <Card className="gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl animate-pulse">
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-muted rounded mb-1" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-6 w-16 bg-muted rounded-lg" />
                    <div className="h-3 w-12 bg-muted rounded" />
                  </div>
                </div>
              ))
            ) : recentApplications.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">No recent applications found.</div>
            ) : (
              recentApplications.map((app, index) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-accent/50 transition-all duration-200 cursor-pointer border border-border/30 hover:border-primary/30"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">{app.title}</h4>
                    <p className="text-sm text-muted-foreground">{app.company}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getStatusColor(app.status)} border rounded-lg px-3 py-1`}>{app.status}</Badge>
                    <span className="text-sm text-muted-foreground">{getDaysAgo(app.date_applied)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
