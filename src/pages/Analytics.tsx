
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Area, AreaChart, PieChart, Pie, Cell } from "recharts";
import { Calendar, Filter, Download, TrendingUp, Users, Target, Zap } from "lucide-react";
import { useState } from "react";

const platformData = [
  { name: "LinkedIn", applications: 45, color: "#00FFFF" },
  { name: "Indeed", applications: 32, color: "#FF9A5C" },
  { name: "Glassdoor", applications: 28, color: "#00FFFF" },
  { name: "Company Site", applications: 23, color: "#FF9A5C" },
  { name: "AngelList", applications: 18, color: "#00FFFF" },
];

const timelineData = [
  { date: "Week 1", applications: 12, interviews: 2 },
  { date: "Week 2", applications: 18, interviews: 4 },
  { date: "Week 3", applications: 15, interviews: 6 },
  { date: "Week 4", applications: 22, interviews: 8 },
  { date: "Week 5", applications: 28, interviews: 5 },
  { date: "Week 6", applications: 25, interviews: 9 },
];

const statusData = [
  { name: "Applied", value: 78, color: "#6B7280" },
  { name: "Phone Screen", value: 24, color: "#F59E0B" },
  { name: "Interview", value: 18, color: "#00FFFF" },
  { name: "Offer", value: 5, color: "#10B981" },
  { name: "Rejected", value: 12, color: "#EF4444" },
];

const chartConfig = {
  applications: {
    label: "Applications",
    color: "#00FFFF",
  },
  interviews: {
    label: "Interviews", 
    color: "#FF9A5C",
  },
};

export default function Analytics() {
  const [filterOpen, setFilterOpen] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [platformFilters, setPlatformFilters] = useState({
    linkedin: true,
    indeed: true,
    glassdoor: true,
    company: true,
    angellist: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Analytics
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-transparent rounded-full mt-2"></div>
          </h1>
          <p className="text-muted-foreground">Insights into your job search performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border/50 hover:border-primary/50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setFilterOpen(!filterOpen)}
            className="border-border/50 hover:border-primary/50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filter Panel */}
        {filterOpen && (
          <div className="lg:col-span-3">
            <Card className="gradient-card border-border/50 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Range */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["7d", "30d", "90d", "1y"].map((range) => (
                      <Button
                        key={range}
                        variant={dateRange === range ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateRange(range)}
                        className={dateRange === range ? "glow-teal" : "border-border/50"}
                      >
                        {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "1 Year"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Platform Filters */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Platforms</label>
                  <div className="space-y-3">
                    {Object.entries(platformFilters).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground capitalize">{key}</span>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            setPlatformFilters(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 space-y-2">
                  <Button className="w-full glow-teal">Apply Filters</Button>
                  <Button variant="outline" className="w-full border-secondary/50 text-secondary hover:bg-secondary/10">
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className={`${filterOpen ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Applications", value: "137", icon: Target, color: "primary", glow: "glow-teal" },
              { label: "Response Rate", value: "28%", icon: TrendingUp, color: "secondary", glow: "glow-orange" },
              { label: "Interviews", value: "34", icon: Users, color: "primary", glow: "glow-teal" },
              { label: "Offers", value: "5", icon: Zap, color: "secondary", glow: "glow-orange" },
            ].map((stat, index) => (
              <Card key={index} className={`gradient-card border-border/50 shadow-elegant hover:shadow-lg transition-all duration-300 hover:${stat.glow}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${stat.color}/10 border border-${stat.color}/20`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Applications by Platform */}
            <Card className="gradient-card border-border/50 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Applications by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="applications" fill="#00FFFF" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="gradient-card border-border/50 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                      <Badge variant="secondary" className="text-xs">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline Chart */}
            <Card className="xl:col-span-2 gradient-card border-border/50 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Application & Interview Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="applications" 
                        stackId="1"
                        stroke="#00FFFF" 
                        fill="url(#tealGradient)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="interviews" 
                        stroke="#FF9A5C" 
                        strokeWidth={3}
                        dot={{ fill: "#FF9A5C", strokeWidth: 2, r: 4 }}
                      />
                      <defs>
                        <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00FFFF" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
