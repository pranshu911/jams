import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Calendar, User, DollarSign, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useSession } from '../hooks/useSession';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

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
  type: z.enum(['full-time', 'part-time', 'internship']).default('full-time'),
  isRemote: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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

const employmentTypes = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'internship', label: 'Internship' },
];

export default function NewApplication() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeSalary, setIncludeSalary] = useState(false);
  const [includeFollowUp, setIncludeFollowUp] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      company: '',
      location: '',
      description: '',
      platform: '',
      status: 'applied',
      salary: '',
      hrContact: '',
      referral: '',
      dateApplied: new Date().toISOString().split('T')[0],
      followUp: '',
      type: 'full-time',
      isRemote: false,
      notes: '',
    },
  });

  const onSubmit = async (formData: FormData) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to save an application');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const applicationData = {
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
        notes: formData.notes || null,
        user_id: session.user.id,
        type: formData.type,
        is_remote: formData.isRemote,
      };

      const { error } = await supabase
        .from('job_applications')
        .insert([applicationData]);

      if (error) {
        if (error.code === '42501') {
          throw new Error('Permission denied. You do not have permission to create this record.');
        }
        throw error;
      }
      
      toast.success('Application saved successfully!');
      navigate('/applications');
    } catch (error: any) {
      console.error('Supabase error:', error);
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          toast.error('Permission denied. Please check your account permissions.');
        } else {
          toast.error(`Failed to save application: ${error.message}`);
        }
      } else {
        toast.error('Failed to save application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setIncludeSalary(false);
    setIncludeFollowUp(false);
    toast.info('Form reset successfully');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/applications')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">New Application</h1>
            <p className="text-muted-foreground mt-1">Add a new job application to your tracker</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card className="gradient-card shadow-elegant border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="h-5 w-5 text-primary" />
                  Basic Information
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
                        <Input 
                          placeholder="Senior Software Engineer" 
                          className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20" 
                          {...field} 
                        />
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
                        <Input 
                          placeholder="Tech Corp Inc." 
                          className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20" 
                          {...field} 
                        />
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
                      <FormLabel className="text-foreground font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="San Francisco, CA" 
                          className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20" 
                          {...field} 
                        />
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
                      <FormLabel className="text-foreground font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date Applied *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card className="gradient-card shadow-elegant border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Send className="h-5 w-5 text-primary" />
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
                        <Textarea 
                          placeholder="Brief description of the role and requirements..."
                          className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20 min-h-[120px] resize-y"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Platform, Status, Employment Type in a single row on desktop, stacked on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Platform *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-muted/30 border-border focus:border-primary">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border-border">
                            {platforms.map((platform) => (
                              <SelectItem key={platform.value} value={platform.value}>
                                <span className="flex items-center gap-2">
                                  {platform.icon} {platform.label}
                                </span>
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
                            <SelectTrigger className="bg-muted/30 border-border focus:border-primary">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border-border">
                            {statuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                <span className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                                  {status.label}
                                </span>
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Employment Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-muted/30 border-border focus:border-primary">
                              <SelectValue placeholder="Select employment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border-border">
                            {employmentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Is Remote Checkbox */}
                <FormField
                  control={form.control}
                  name="isRemote"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={e => field.onChange(e.target.checked)}
                          className="w-4 h-4 text-primary bg-muted border-border rounded focus:ring-primary focus:ring-2"
                        />
                      </FormControl>
                      <FormLabel className="text-foreground font-medium">Is Remote?</FormLabel>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Additional Information */}
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
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="includeSalary"
                        checked={includeSalary}
                        onChange={(e) => setIncludeSalary(e.target.checked)}
                        className="w-4 h-4 text-primary bg-muted border-border rounded focus:ring-primary focus:ring-2"
                      />
                      <Label htmlFor="includeSalary" className="text-foreground font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Include Salary Information
                      </Label>
                    </div>
                    
                    {includeSalary && (
                      <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="e.g., $120,000 - $150,000" 
                                className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="hrContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">HR Contact Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="recruiter@company.com" 
                            className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20" 
                            {...field} 
                          />
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
                          <Input 
                            placeholder="John Doe" 
                            className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="includeFollowUp"
                        checked={includeFollowUp}
                        onChange={(e) => setIncludeFollowUp(e.target.checked)}
                        className="w-4 h-4 text-primary bg-muted border-border rounded focus:ring-primary focus:ring-2"
                      />
                      <Label htmlFor="includeFollowUp" className="text-foreground font-medium">
                        Set Follow-up Reminder
                      </Label>
                    </div>
                    
                    {includeFollowUp && (
                      <FormField
                        control={form.control}
                        name="followUp"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="date" 
                                className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Notes Textarea */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes or comments..."
                            className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20 min-h-[80px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4 -mx-6">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-black"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Save Application
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="w-full md:w-auto"
                  >
                    Reset Form
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/applications')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
