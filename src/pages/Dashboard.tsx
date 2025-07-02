import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Calendar, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Total Applications",
    value: "24",
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/20",
    glowClass: "hover:glow-teal",
  },
  {
    title: "Interviews Scheduled",
    value: "6",
    icon: Calendar,
    color: "text-secondary",
    bgColor: "bg-secondary/20",
    glowClass: "hover:glow-orange",
  },
  {
    title: "Offers Received",
    value: "2",
    icon: Users,
    color: "text-green-400",
    bgColor: "bg-green-400/20",
  },
  {
    title: "Response Rate",
    value: "65%",
    icon: TrendingUp,
    color: "text-purple-400",
    bgColor: "bg-purple-400/20",
  },
];

const recentApplications = [
  {
    company: "TechCorp Inc.",
    position: "Senior Frontend Developer",
    status: "Interview",
    date: "2 days ago",
  },
  {
    company: "StartupXYZ",
    position: "Full Stack Engineer",
    status: "Applied",
    date: "5 days ago",
  },
  {
    company: "BigTech Co.",
    position: "Product Manager",
    status: "Phone Screen",
    date: "1 week ago",
  },
];

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
        {/* TEMP: Supabase Test Button */}
        {/*
        <Link to="/supabase-test" style={{ marginLeft: 12 }}>
          <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
            Test Supabase
          </Button>
        </Link>
        */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className={`gradient-card border-border/50 shadow-elegant transition-all duration-300 hover:shadow-2xl hover:scale-105 ${stat.glowClass || ''}`}>
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
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 gradient-card border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-foreground">Applications Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-2xl flex items-center justify-center border border-border/30">
              <p className="text-muted-foreground">Chart visualization would go here</p>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-foreground">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-secondary/10 via-secondary/5 to-primary/10 rounded-2xl flex items-center justify-center border border-border/30">
              <p className="text-muted-foreground">Donut chart would go here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((app, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-accent/50 transition-all duration-200 cursor-pointer border border-border/30 hover:border-primary/30"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">{app.position}</h4>
                  <p className="text-sm text-muted-foreground">{app.company}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={`${getStatusColor(app.status)} border rounded-lg px-3 py-1`}>{app.status}</Badge>
                  <span className="text-sm text-muted-foreground">{app.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
