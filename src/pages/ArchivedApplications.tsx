import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, ExternalLink, Loader2, Edit, ArchiveRestore, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
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
import { useApplications } from "@/hooks/useApplications";
import { supabase } from '../lib/supabase';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

const mapApplication = (app: any) => ({
  ...app,
  title: app.title,
  dateApplied: app.date_applied,
  lastUpdated: app.updated_at || app.created_at,
  ctc: app.salary || 'Not disclosed',
  referral: app.referral || '',
  hrContact: app.hr_contact || '',
});

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

export default function ArchivedApplications() {
  const { data: applications = [], isLoading, error, refresh } = useApplications();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'delete'|'unarchive'|'rejected'|null>(null);
  const [pendingApp, setPendingApp] = useState<any>(null);
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading archived applications",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const archivedApplications = applications.filter(app => app.is_archive);

  const handleViewDetails = (application: any) => {
    setSelectedApplication(mapApplication(application));
    setEditMode(false);
    setIsDetailsOpen(true);
  };

  const handleEditApplication = (application: any) => {
    setSelectedApplication(mapApplication(application));
    setEditMode(true);
    setIsDetailsOpen(true);
  };

  const handleUnarchiveApplication = async (application: any) => {
    setDialogType('unarchive');
    setPendingApp(application);
    setDialogOpen(true);
  };

  const handleDeleteApplication = async (application: any) => {
    setDialogType('delete');
    setPendingApp(application);
    setDialogOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(archivedApplications.map(app => app.id));
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

  const handleBulkAction = async (action: 'rejected'|'unarchive'|'delete') => {
    if (selectedApplications.length === 0) return;
    let updateData = {};
    let actionText = '';
    if (action === 'rejected') {
      updateData = { status: 'Rejected' };
      actionText = 'Mark as Rejected';
    } else if (action === 'unarchive') {
      updateData = { is_archive: false };
      actionText = 'Un-archive';
    }
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('job_applications')
          .delete()
          .in('id', selectedApplications);
        if (error) throw error;
        toast({ title: 'Applications deleted.' });
      } else {
        const { error } = await supabase
          .from('job_applications')
          .update(updateData)
          .in('id', selectedApplications);
        if (error) throw error;
        toast({ title: `Applications updated: ${actionText}` });
      }
      setSelectedApplications([]);
      setDialogOpen(false);
      setDialogType(null);
      refresh();
    } catch (error) {
      toast({ title: 'Bulk action failed.', variant: 'destructive' });
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div style={{ maxWidth: '60%' }}>
          <h1 className="text-3xl font-bold text-foreground">Archived Applications</h1>
          <p className="text-muted-foreground mt-1">
            Archived applications are not included in analytics or reporting. Use this space as a secondary storage for applications you want to keep but remove from active tracking and analysis.
          </p>
        </div>
        <Link to="/applications">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-teal">
            View Active Applications
          </Button>
        </Link>
      </div>

      {/* Bulk Actions Bar */}
      {selectedApplications.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 backdrop-blur-sm mb-4">
          <div className="flex items-center justify-between">
            <span className="text-primary font-medium">
              {selectedApplications.length} application(s) selected
            </span>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/20 rounded-lg" onClick={() => { setDialogType('rejected'); setDialogOpen(true); }}>
                Mark as Rejected
              </Button>
              <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/20 rounded-lg" onClick={() => { setDialogType('unarchive'); setDialogOpen(true); }}>
                Un-Archive
              </Button>
              <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg" onClick={() => { setDialogType('delete'); setDialogOpen(true); }}>
                Delete
              </Button>
            </div>
          </div>
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {dialogType === 'delete' && 'Delete Applications'}
                  {dialogType === 'unarchive' && 'Un-archive Applications'}
                  {dialogType === 'rejected' && 'Mark as Rejected'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {dialogType === 'delete' && 'Are you sure you want to delete the selected applications? This action cannot be undone.'}
                  {dialogType === 'unarchive' && 'Are you sure you want to un-archive the selected applications?'}
                  {dialogType === 'rejected' && 'Mark all selected applications as Rejected?'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleBulkAction(dialogType!)}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading archived applications...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Applications Table */}
          <div className="gradient-card border border-border/50 rounded-2xl overflow-hidden shadow-elegant">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedApplications.length === archivedApplications.length && archivedApplications.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">Job Title</TableHead>
                  <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">Company</TableHead>
                  <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">Date Applied</TableHead>
                  <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">Platform</TableHead>
                  <TableHead className="font-semibold text-sm text-blue-100/80 uppercase tracking-wider">Location</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No archived applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  archivedApplications.map((app) => (
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
                        {app.title}
                      </TableCell>
                      <TableCell className="text-foreground">{app.company}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(app.date_applied).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(app.status)} border rounded-lg px-3 py-1 transition-all duration-200`}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{app.platform}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {app.location ? app.location.split(',')[0] : ''}
                      </TableCell>
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
                            <DropdownMenuItem 
                              className="hover:bg-accent/50"
                              onClick={() => handleEditApplication(app)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="hover:bg-accent/50"
                              onClick={() => handleUnarchiveApplication(app)}
                            >
                              <ArchiveRestore className="w-4 h-4 mr-2" />
                              Un-archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-400 hover:bg-red-500/20 focus:text-red-400"
                              onClick={() => handleDeleteApplication(app)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Application Details Drawer */}
          {selectedApplication && (
            <ApplicationDetails
              application={selectedApplication}
              isOpen={isDetailsOpen}
              onClose={() => setIsDetailsOpen(false)}
              editMode={editMode}
              refresh={refresh}
            />
          )}
        </div>
      )}
    </div>
  );
} 