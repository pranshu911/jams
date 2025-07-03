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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

interface Application {
  id: number;
  title: string;
  company: string;
  dateApplied: string;
  status: string;
  platform: string;
  lastUpdated: string;
  location?: string;
  salary?: string;
  referral?: string;
  hrContact?: string;
  description?: string;
  notes?: string;
  followUp?: string;
  is_archive: boolean;
}

interface ApplicationDetailsProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  editMode?: boolean;
  refresh?: () => void;
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

const formSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  description: z.string().optional(),
  platform: z.string().min(1, 'Please select a platform'),
  status: z.string().min(1, 'Please select a status'),
  salary: z.string().optional(),
  hrContact: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  referral: z.string().optional(),
  dateApplied: z.string().min(1, 'Application date is required'),
  followUp: z.string().optional(),
});

const platforms = [
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'indeed', label: 'Indeed', icon: '🔍' },
  { value: 'company-site', label: 'Company Site', icon: '🏢' },
  { value: 'glassdoor', label: 'Glassdoor', icon: '🏠' },
  { value: 'other', label: 'Other', icon: '📄' },
];

const statuses = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-500' },
  { value: 'phone-screen', label: 'Phone Screen', color: 'bg-yellow-500' },
  { value: 'interview', label: 'Interview', color: 'bg-primary' },
  { value: 'offer', label: 'Offer', color: 'bg-green-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
];

export function ApplicationDetails({ application, isOpen, onClose, editMode = false, refresh }: ApplicationDetailsProps) {
  const [isEditing, setIsEditing] = React.useState(editMode);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isArchiving, setIsArchiving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<'delete' | 'archive' | null>(null);
  React.useEffect(() => { setIsEditing(editMode); }, [application, editMode]);
  if (!application) return null;

  const getPlatformValue = (label: string) => {
    const found = platforms.find(p => p.label === label);
    return found ? found.value : '';
  };
  const getStatusValue = (label: string) => {
    const found = statuses.find(s => s.label === label);
    return found ? found.value : '';
  };
  const defaultValues = React.useMemo(() => ({
    title: application.title || '',
    company: application.company || '',
    location: application.location || '',
    description: application.description || '',
    platform: getPlatformValue(application.platform),
    status: getStatusValue(application.status),
    salary: application.salary ? String(application.salary) : '',
    hrContact: application.hrContact || '',
    referral: application.referral || '',
    dateApplied: application.dateApplied || '',
    followUp: application.followUp || '',
  }), [application]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
    values: defaultValues,
  });

  // Edit submit handler
  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const updateData = {
        title: formData.title,
        company: formData.company,
        location: formData.location || null,
        description: formData.description || null,
        platform: platforms.find(p => p.value === formData.platform)?.label || formData.platform,
        status: statuses.find(s => s.value === formData.status)?.label || formData.status,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        hr_contact: formData.hrContact || null,
        referral: formData.referral || null,
        date_applied: formData.dateApplied,
        follow_up: formData.followUp || null,
      };
      const { error } = await supabase
        .from('job_applications')
        .update(updateData)
        .eq('id', application.id);
      if (error) throw error;
      toast.success('Application updated successfully!');
      setIsEditing(false);
      onClose();
      if (refresh) refresh();
    } catch (error) {
      toast.error('Failed to update application.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    setDialogType('delete');
    setDialogOpen(true);
  };

  // Archive handler
  const handleArchive = async () => {
    setDialogType('archive');
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (dialogType === 'delete') {
      setIsDeleting(true);
      try {
        const { error } = await supabase
          .from('job_applications')
          .delete()
          .eq('id', application.id);
        if (error) throw error;
        toast.success('Application deleted.');
        onClose();
        if (refresh) refresh();
      } catch (error) {
        toast.error('Failed to delete application.');
        console.error(error);
      } finally {
        setIsDeleting(false);
      }
    } else if (dialogType === 'archive') {
      setIsArchiving(true);
      try {
        const { error } = await supabase
          .from('job_applications')
          .update({ is_archive: !application.is_archive })
          .eq('id', application.id);
        if (error) throw error;
        toast.success(application.is_archive ? 'Application un-archived.' : 'Application archived.');
        onClose();
        if (refresh) refresh();
      } catch (error) {
        toast.error(application.is_archive ? 'Failed to un-archive application.' : 'Failed to archive application.');
        console.error(error);
      } finally {
        setIsArchiving(false);
      }
    }
    setDialogOpen(false);
  };

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
                    {application.title}
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
                    <DropdownMenuItem className="hover:bg-accent/50" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Application
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:bg-red-500/20 focus:text-red-400" onClick={handleDelete}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:bg-accent/50"
                      onClick={() => {
                        setDialogType('archive');
                        setDialogOpen(true);
                      }}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      {application.is_archive ? (isArchiving ? 'Un-archiving...' : 'Un-archive') : (isArchiving ? 'Archiving...' : 'Archive')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 p-6 space-y-8">
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Card className="gradient-card shadow-elegant border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Building className="h-5 w-5 text-primary" />
                        Edit Application
                        <div className="h-px bg-gradient-to-r from-secondary/50 to-transparent flex-1 ml-4" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">Job Title *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">Company *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">Location</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateApplied"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">Date Applied *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  <Card className="gradient-card shadow-elegant border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Edit className="h-5 w-5 text-primary" />
                        Job Details
                        <div className="h-px bg-gradient-to-r from-secondary/50 to-transparent flex-1 ml-4" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">Job Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="platform"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground font-medium">Platform *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select platform" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {platforms.map((platform) => (
                                    <SelectItem key={platform.value} value={platform.value}>
                                      {platform.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground font-medium">Status *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {statuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="gradient-card shadow-elegant border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <User className="h-5 w-5 text-primary" />
                        Additional Information
                        <div className="h-px bg-gradient-to-r from-secondary/50 to-transparent flex-1 ml-4" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="salary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground font-medium">Salary</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="hrContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground font-medium">HR Contact Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="referral"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground font-medium">Referral Contact</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="followUp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground font-medium">Follow-up Reminder</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-primary text-white">
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <>
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
                          <p className="text-foreground font-medium">{application.salary || "Not disclosed"}</p>
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
              </>
            )}
          </div>
        </div>
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {dialogType === 'delete'
                  ? 'Delete Application'
                  : application.is_archive
                    ? 'Un-archive Application'
                    : 'Archive Application'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {dialogType === 'delete'
                  ? 'Are you sure you want to delete this application? This action cannot be undone.'
                  : application.is_archive
                    ? 'Are you sure you want to un-archive this application?'
                    : 'Are you sure you want to archive this application? This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                {dialogType === 'delete'
                  ? 'Delete'
                  : application.is_archive
                    ? 'Un-archive'
                    : 'Archive'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}
