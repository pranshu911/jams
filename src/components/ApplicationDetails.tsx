
import React from 'react';
import { X, MoreHorizontal, ExternalLink, Calendar, Mail, Archive, Edit, Trash2, MapPin, Building, DollarSign, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  dateApplied: string;
  status: string;
  platform: string;
  lastUpdated: string;
  location?: string;
  ctc?: string;
  referral?: string;
  hrContact?: string;
  description?: string;
  notes?: string;
}

interface ApplicationDetailsProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Applied":
      return "bg-muted/50 text-muted-foreground border-border hover:bg-muted";
    case "Phone Screen":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30";
    case "Interview":
      return "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30";
    case "Offer":
      return "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30";
    case "Rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30";
    default:
      return "bg-muted/50 text-muted-foreground border-border hover:bg-muted";
  }
};

const timelineEvents = [
  { date: "2024-01-25", event: "Follow-up email sent", type: "action" },
  { date: "2024-01-22", event: "Interview scheduled", type: "milestone" },
  { date: "2024-01-18", event: "Phone screen completed", type: "milestone" },
  { date: "2024-01-15", event: "Application submitted", type: "milestone" },
];

export function ApplicationDetails({ application, isOpen, onClose }: ApplicationDetailsProps) {
  if (!application) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl gradient-card border-l border-border/50 p-0 overflow-y-auto">
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b border-border/30">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center glow-teal">
                  <Building className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <SheetTitle className="text-2xl font-bold text-foreground mb-1">
                    {application.jobTitle}
                  </SheetTitle>
                  <p className="text-lg text-muted-foreground">{application.company}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${getStatusColor(application.status)} border rounded-lg px-3 py-1`}>
                  {application.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-accent/50 rounded-lg">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border shadow-elegant">
                    <DropdownMenuItem className="hover:bg-accent/50">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Application
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-accent/50">
                      Change Status
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:bg-red-500/20 focus:text-red-400">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 p-6 space-y-8">
            {/* Overview Panel */}
            <div className="gradient-card border border-border/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-secondary/30">
                Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Platform</p>
                      <p className="text-foreground font-medium">{application.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="text-foreground font-medium">{application.location || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date Applied</p>
                      <p className="text-foreground font-medium">{application.dateApplied}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">CTC</p>
                      <p className="text-foreground font-medium">{application.ctc || "Not disclosed"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Referral</p>
                      <p className="text-foreground font-medium">{application.referral || "None"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">HR Contact</p>
                      <p className="text-foreground font-medium">{application.hrContact || "Not available"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Notes */}
            <div className="gradient-card border border-border/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-secondary/30">
                Description & Notes
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-secondary mb-3">Job Description</h4>
                  <div className="bg-muted/20 rounded-xl p-4 border border-border/20">
                    <p className="text-muted-foreground leading-relaxed">
                      {application.description || "We are looking for an experienced Senior Frontend Developer to join our dynamic team. You will be responsible for developing user-facing web applications using modern JavaScript frameworks and ensuring optimal user experience across all devices."}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-secondary mb-3">My Notes</h4>
                  <div className="bg-muted/20 rounded-xl p-4 border border-border/20">
                    <p className="text-muted-foreground leading-relaxed">
                      {application.notes || "Great company culture based on Glassdoor reviews. The tech stack aligns well with my experience. Need to follow up next week if no response."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="gradient-card border border-border/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-secondary/30">
                Timeline & Activity
              </h3>
              <div className="space-y-6">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${event.type === 'milestone' ? 'bg-primary glow-teal' : 'bg-secondary glow-orange'}`} />
                      {index < timelineEvents.length - 1 && (
                        <div className="w-px h-8 bg-gradient-to-b from-border/50 to-transparent mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="bg-muted/20 rounded-xl p-4 border border-border/20">
                        <p className="text-foreground font-medium">{event.event}</p>
                        <p className="text-sm text-muted-foreground mt-1">{event.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Action Bar */}
          <div className="p-6 border-t border-border/30 bg-gradient-to-r from-card/95 to-card">
            <div className="flex flex-wrap gap-3">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-teal">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="border-secondary/30 text-secondary hover:bg-secondary/20 glow-orange">
                <Mail className="w-4 h-4 mr-2" />
                Send Follow-Up
              </Button>
              <Button variant="outline" className="border-border/50 text-muted-foreground hover:bg-muted/20">
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
