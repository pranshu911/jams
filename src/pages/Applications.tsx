import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, MoreHorizontal, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApplicationDetails } from "@/components/ApplicationDetails";

const applications = [
  {
    id: 1,
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    dateApplied: "2024-01-15",
    status: "Interview",
    platform: "LinkedIn",
    lastUpdated: "2024-01-20",
    location: "San Francisco, CA",
    ctc: "$120,000 - $150,000",
    referral: "John Smith",
    hrContact: "sarah@techcorp.com",
  },
  {
    id: 2,
    jobTitle: "Full Stack Engineer",
    company: "StartupXYZ",
    status: "Applied",
    dateApplied: "2024-01-10",
    platform: "Indeed",
    lastUpdated: "2024-01-10",
    location: "Remote",
    ctc: "Not disclosed",
    referral: "",
    hrContact: "",
  },
  {
    id: 3,
    jobTitle: "Product Manager",
    company: "BigTech Co.",
    status: "Phone Screen",
    dateApplied: "2024-01-08",
    platform: "Company Website",
    lastUpdated: "2024-01-18",
    location: "New York, NY",
    ctc: "$140,000 - $180,000",
    referral: "",
    hrContact: "recruiter@bigtech.com",
  },
  {
    id: 4,
    jobTitle: "UI/UX Designer",
    company: "DesignStudio",
    status: "Offer",
    dateApplied: "2024-01-05",
    platform: "Glassdoor",
    lastUpdated: "2024-01-22",
    location: "Los Angeles, CA",
    ctc: "$90,000 - $110,000",
    referral: "Maria Garcia",
    hrContact: "hr@designstudio.com",
  },
  {
    id: 5,
    jobTitle: "Data Scientist",
    company: "Analytics Pro",
    status: "Rejected",
    dateApplied: "2024-01-03",
    platform: "AngelList",
    lastUpdated: "2024-01-25",
    location: "Seattle, WA",
    ctc: "Not disclosed",
    referral: "",
    hrContact: "",
  },
];

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

export default function Applications() {
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<typeof applications[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (application: typeof applications[0]) => {
    setSelectedApplication(application);
    setIsDetailsOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(applications.map(app => app.id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectApplication = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedApplications([...selectedApplications, id]);
    } else {
      setSelectedApplications(selectedApplications.filter(appId => appId !== id));
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-1">Track and manage your job applications</p>
        </div>
        <Link to="/applications/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-teal">
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Bulk Actions Bar */}
      {selectedApplications.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-primary font-medium">
              {selectedApplications.length} application(s) selected
            </span>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/20 rounded-lg">
                Mark as Interviewed
              </Button>
              <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="gradient-card border border-border/50 rounded-2xl overflow-hidden shadow-elegant">
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedApplications.length === applications.length}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">
                Job Title
              </TableHead>
              <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">
                Company
              </TableHead>
              <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">
                Date Applied
              </TableHead>
              <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">
                Platform
              </TableHead>
              <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">
                Last Updated
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow 
                key={app.id} 
                className="border-b border-border/30 hover:bg-accent/30 transition-all duration-200 cursor-pointer"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedApplications.includes(app.id)}
                    onCheckedChange={(checked) => handleSelectApplication(app.id, checked as boolean)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </TableCell>
                <TableCell className="font-medium text-primary hover:text-primary/80 transition-colors">
                  {app.jobTitle}
                </TableCell>
                <TableCell className="text-foreground">{app.company}</TableCell>
                <TableCell className="text-muted-foreground">{app.dateApplied}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(app.status)} border rounded-lg px-3 py-1 transition-all duration-200`}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{app.platform}</TableCell>
                <TableCell className="text-muted-foreground">{app.lastUpdated}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-accent/50 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border shadow-elegant">
                      <DropdownMenuItem 
                        className="hover:bg-accent/50"
                        onClick={() => handleViewDetails(app)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-accent/50">Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:bg-red-500/20 focus:text-red-400">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          className="w-14 h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-elegant hover:shadow-2xl transition-all duration-300 hover:scale-110 glow-orange"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Application Details Drawer */}
      <ApplicationDetails
        application={selectedApplication}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
}
