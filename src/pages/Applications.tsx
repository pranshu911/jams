import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, MoreHorizontal, ExternalLink, Loader2, Edit, Archive, Trash2 } from "lucide-react";
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
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';

// Helper function to map database fields to the expected format
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

export default function Applications() {
  const { data: applications = [], isLoading, error, refresh } = useApplications();
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'delete'|'archive'|'interview'|'rejected'|null>(null);
  const [pendingApp, setPendingApp] = useState<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [filteredApplications, setFilteredApplications] = useState(applications.filter(app => !app.is_archive));
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'custom' | null>(null);
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Get all unique platforms from applications
  const allPlatforms = Array.from(new Set(applications.map(app => app.platform).filter(Boolean)));

  // Debounced search/filter logic
  useEffect(() => {
    const handler = setTimeout(() => {
      let filtered = applications.filter(app => !app.is_archive);
      // Status filter
      if (statusFilters.length > 0) {
        filtered = filtered.filter(app => statusFilters.includes(app.status));
      }
      // Platform filter
      if (platformFilters.length > 0) {
        filtered = filtered.filter(app => platformFilters.includes(app.platform));
      }
      // Date filter
      if (dateFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateFilter === 'today') {
          filtered = filtered.filter(app => {
            const applied = new Date(app.date_applied);
            applied.setHours(0, 0, 0, 0);
            return applied.getTime() === today.getTime();
          });
        } else if (dateFilter === '7days') {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 6); // includes today
          filtered = filtered.filter(app => {
            const applied = new Date(app.date_applied);
            applied.setHours(0, 0, 0, 0);
            return applied >= weekAgo && applied <= today;
          });
        } else if (dateFilter === '30days') {
          const monthAgo = new Date(today);
          monthAgo.setDate(today.getDate() - 29); // includes today
          filtered = filtered.filter(app => {
            const applied = new Date(app.date_applied);
            applied.setHours(0, 0, 0, 0);
            return applied >= monthAgo && applied <= today;
          });
        } else if (dateFilter === 'custom' && customDateRange.from && customDateRange.to) {
          const from = new Date(customDateRange.from);
          from.setHours(0, 0, 0, 0);
          const to = new Date(customDateRange.to);
          to.setHours(0, 0, 0, 0);
          filtered = filtered.filter(app => {
            const applied = new Date(app.date_applied);
            applied.setHours(0, 0, 0, 0);
            return applied >= from && applied <= to;
          });
        }
      }
      // Search
      if (searchValue.trim()) {
        const value = searchValue.toLowerCase();
        filtered = filtered.filter(app =>
          app.title.toLowerCase().includes(value) ||
          app.company.toLowerCase().includes(value) ||
          (app.location && app.location.toLowerCase().includes(value))
        );
      }
      setFilteredApplications(filtered);
      setPage(1); // Reset to first page on filter/search change
    }, 200);
    return () => clearTimeout(handler);
  }, [applications, searchValue, statusFilters, platformFilters, dateFilter, customDateRange]);

  // Pagination logic
  const total = filteredApplications.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const paginatedApplications = filteredApplications.slice(startIdx, endIdx);

  // Filter popover UI
  const statusOptions = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'];

  // Show error toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading applications",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(filteredApplications.map(app => app.id));
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

  const handleDeleteApplication = (application: any) => {
    setDialogType('delete');
    setPendingApp(application);
    setDialogOpen(true);
  };

  const handleArchiveApplication = (application: any) => {
    setDialogType('archive');
    setPendingApp(application);
    setDialogOpen(true);
  };

  const handleMarkInterviewed = (application: any) => {
    setDialogType('interview');
    setPendingApp(application);
    setDialogOpen(true);
  };

  const handleMarkRejected = (application: any) => {
    setDialogType('rejected');
    setPendingApp(application);
    setDialogOpen(true);
  };

  const confirmDialogAction = async () => {
    try {
      if (selectedApplications.length > 0) {
        // Bulk action
        if (dialogType === 'archive') {
          await handleBulkAction('archive');
        } else if (dialogType === 'delete') {
          await handleBulkAction('delete');
        } else if (dialogType === 'interview') {
          await handleBulkAction('interview');
        } else if (dialogType === 'rejected') {
          await handleBulkAction('rejected');
        }
      } else if (pendingApp) {
        // Single action
        if (dialogType === 'archive') {
          const { error } = await supabase
            .from('job_applications')
            .update({ is_archive: true })
            .eq('id', pendingApp.id);
          if (error) throw error;
          toast({ title: 'Application archived.' });
          refresh();
        } else if (dialogType === 'delete') {
          const { error } = await supabase
            .from('job_applications')
            .delete()
            .eq('id', pendingApp.id);
          if (error) throw error;
          toast({ title: 'Application deleted.' });
          refresh();
        } else if (dialogType === 'interview') {
          const { error } = await supabase
            .from('job_applications')
            .update({ status: 'Interview' })
            .eq('id', pendingApp.id);
          if (error) throw error;
          toast({ title: 'Application marked as Interviewed.' });
          refresh();
        } else if (dialogType === 'rejected') {
          const { error } = await supabase
            .from('job_applications')
            .update({ status: 'Rejected' })
            .eq('id', pendingApp.id);
          if (error) throw error;
          toast({ title: 'Application marked as Rejected.' });
          refresh();
        }
      }
    } catch (error) {
      toast({ title: 'Action failed.', variant: 'destructive' });
      console.error(error);
    } finally {
      setDialogOpen(false);
      setDialogType(null);
      setPendingApp(null);
      setSelectedApplications([]);
    }
  };

  const handleBulkAction = async (action: 'interview'|'rejected'|'archive'|'delete') => {
    if (selectedApplications.length === 0) return;
    let updateData = {};
    let actionText = '';
    if (action === 'interview') {
      updateData = { status: 'Interview' };
      actionText = 'Mark as Interviewed';
    } else if (action === 'rejected') {
      updateData = { status: 'Rejected' };
      actionText = 'Mark as Rejected';
    } else if (action === 'archive') {
      updateData = { is_archive: true };
      actionText = 'Archive';
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
    <div className="flex flex-col space-y-6 w-full p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-1">Track and manage your job applications</p>
        </div>
        <div className="flex flex-row gap-2">
          <Link to="/applications/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-teal">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </Link>
          <Link to="/archived-applications">
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
              <Archive className="h-4 w-4 mr-2" />
              View Archived Applications
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar + Filter Button + Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by title, company, or location"
          className="px-4 py-2 border border-border rounded-lg bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition w-full md:flex-grow"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
        <div className="flex flex-row gap-2 md:flex-shrink-0">
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-border/60">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[420px] p-6 rounded-2xl shadow-elegant border border-border/60 bg-background">
              <div className="flex flex-row gap-8">
                {/* Status Filter */}
                <div>
                  <div className="font-semibold text-base mb-3 text-foreground">Filter by Status</div>
                  {statusOptions.map(status => (
                    <div key={status} className="flex items-center gap-3 mb-2">
                      <Checkbox
                        checked={statusFilters.includes(status)}
                        onCheckedChange={checked => {
                          setStatusFilters(checked
                            ? [...statusFilters, status]
                            : statusFilters.filter(s => s !== status));
                        }}
                        id={`status-${status}`}
                        className="rounded-md w-5 h-5 border-2 border-border"
                      />
                      <label htmlFor={`status-${status}`} className="text-base text-foreground cursor-pointer">{status}</label>
                    </div>
                  ))}
                </div>
                {/* Platform Filter */}
                <div>
                  <div className="font-semibold text-base mb-3 text-foreground">Filter by Platform</div>
                  {allPlatforms.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No platforms</div>
                  ) : allPlatforms.map(platform => (
                    <div key={platform} className="flex items-center gap-3 mb-2">
                      <Checkbox
                        checked={platformFilters.includes(platform)}
                        onCheckedChange={checked => {
                          setPlatformFilters(checked
                            ? [...platformFilters, platform]
                            : platformFilters.filter(p => p !== platform));
                        }}
                        id={`platform-${platform}`}
                        className="rounded-md w-5 h-5 border-2 border-border"
                      />
                      <label htmlFor={`platform-${platform}`} className="text-base text-foreground cursor-pointer">{platform}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  className="border-border/60 text-muted-foreground hover:text-primary hover:border-primary"
                  onClick={() => { setStatusFilters([]); setPlatformFilters([]); }}
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {/* Date Filter Dropdown */}
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-border/60">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Date
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[340px] p-5 rounded-2xl shadow-elegant border border-border/60 bg-background">
              <div className="flex flex-col gap-3">
                {[
                  { key: 'today', label: 'Today' },
                  { key: '7days', label: 'Past 7 days' },
                  { key: '30days', label: 'Past 30 days' },
                  { key: 'custom', label: 'Custom range' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer text-base">
                    <span className={
                      cn(
                        "inline-flex items-center justify-center w-5 h-5 border-2 border-border bg-muted/30 transition-colors",
                        dateFilter === opt.key ? "bg-primary border-primary" : "bg-muted/30 border-border",
                        "rounded-md"
                      )
                    }>
                      <input
                        type="radio"
                        name="date-filter"
                        value={opt.key}
                        checked={dateFilter === opt.key}
                        onChange={() => setDateFilter(opt.key as any)}
                        className="appearance-none w-4 h-4 m-0 p-0 cursor-pointer"
                        style={{ outline: 'none' }}
                      />
                      {dateFilter === opt.key && (
                        <span className="block w-3 h-3 bg-primary rounded-sm" />
                      )}
                    </span>
                    {opt.label}
                  </label>
                ))}
                {dateFilter === 'custom' && (
                  <div className="mt-2">
                    <Calendar
                      mode="range"
                      selected={customDateRange}
                      onSelect={range => setCustomDateRange(range as any)}
                      numberOfMonths={1}
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>From: {customDateRange.from ? customDateRange.from.toLocaleDateString() : '--'}</span>
                      <span>To: {customDateRange.to ? customDateRange.to.toLocaleDateString() : '--'}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    className="border-border/60 text-muted-foreground hover:text-primary hover:border-primary"
                    onClick={() => { setDateFilter(null); setCustomDateRange({ from: undefined, to: undefined }); }}
                  >
                    Clear Date
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search/Filter Info */}
      {(searchValue || statusFilters.length > 0 || platformFilters.length > 0 || dateFilter) && (
        <span className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-2 items-center">
          {searchValue && (
            <>
              Showing results for <span className="font-semibold text-primary">"{searchValue}"</span>
            </>
          )}
          {statusFilters.length > 0 && (
            <>
              <span className="text-muted-foreground">|</span> Status:
              {statusFilters.map(s => (
                <span key={s} className="ml-1 font-semibold text-primary">{s}</span>
              ))}
            </>
          )}
          {platformFilters.length > 0 && (
            <>
              <span className="text-muted-foreground">|</span> Platform:
              {platformFilters.map(p => (
                <span key={p} className="ml-1 font-semibold text-primary">{p}</span>
              ))}
            </>
          )}
          {dateFilter && (
            <>
              <span className="text-muted-foreground">|</span> Date:
              <span className="ml-1 font-semibold text-primary">
                {dateFilter === 'today' && 'Today'}
                {dateFilter === '7days' && 'Past 7 days'}
                {dateFilter === '30days' && 'Past 30 days'}
                {dateFilter === 'custom' && customDateRange.from && customDateRange.to && `${customDateRange.from.toLocaleDateString()} - ${customDateRange.to.toLocaleDateString()}`}
                {dateFilter === 'custom' && (!customDateRange.from || !customDateRange.to) && 'Custom range'}
              </span>
            </>
          )}
        </span>
      )}

      {/* Bulk Actions Bar */}
      {selectedApplications.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-primary font-medium">
              {selectedApplications.length} application(s) selected
            </span>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/20 rounded-lg" onClick={() => { setDialogType('interview'); setDialogOpen(true); }}>
                Mark as Interviewed
              </Button>
              <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/20 rounded-lg" onClick={() => { setDialogType('rejected'); setDialogOpen(true); }}>
                Mark as Rejected
              </Button>
              <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/20 rounded-lg" onClick={() => { setDialogType('archive'); setDialogOpen(true); }}>
                Archive
              </Button>
              <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg" onClick={() => { setDialogType('delete'); setDialogOpen(true); }}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading applications...</span>
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
                      checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableHead>
                  <TableHead className="w-16 font-semibold text-sm text-blue-100/80 uppercase tracking-wider text-center">S.No.</TableHead>
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
                    Location
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApplications.map((app, idx) => (
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
                    <TableCell className="text-center text-muted-foreground font-semibold">{startIdx + idx + 1}</TableCell>
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
                            onClick={() => setTimeout(() => handleArchiveApplication(app), 0)}
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-red-500/20 focus:text-red-400"
                            onClick={() => setTimeout(() => handleDeleteApplication(app), 0)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Footer */}
          {total > PAGE_SIZE && (
            <div className="flex justify-end items-center mt-2">
              <span className="text-sm text-muted-foreground mr-4">
                Showing {startIdx + 1}-{endIdx} of {total} applications
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full mr-1"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                aria-label="Previous page"
              >
                <span className="sr-only">Previous</span>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                aria-label="Next page"
              >
                <span className="sr-only">Next</span>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Button>
            </div>
          )}

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

      {/* AlertDialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogType === 'delete' && 'Delete Applications'}
              {dialogType === 'archive' && 'Archive Applications'}
              {dialogType === 'interview' && 'Mark as Interviewed'}
              {dialogType === 'rejected' && 'Mark as Rejected'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogType === 'delete' && 'Are you sure you want to delete the selected applications? This action cannot be undone.'}
              {dialogType === 'archive' && 'Are you sure you want to archive the selected applications?'}
              {dialogType === 'interview' && 'Mark all selected applications as Interview?'}
              {dialogType === 'rejected' && 'Mark all selected applications as Rejected?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialogAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
