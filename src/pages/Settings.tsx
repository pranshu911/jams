
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  User, 
  Bell, 
  Palette, 
  Link, 
  Shield, 
  ChevronDown, 
  Mail, 
  Lock, 
  Eye,
  Smartphone,
  Calendar,
  Download,
  Trash2,
  Check,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [openSections, setOpenSections] = useState({
    profile: true,
    notifications: false,
    appearance: false,
    integrations: false,
    privacy: false,
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    browserNotifications: false,
    weeklyDigest: true,
    interviewReminders: true,
    applicationDeadlines: true,
  });

  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const integrations = [
    { name: "LinkedIn", connected: true, icon: "💼", description: "Sync job applications" },
    { name: "Google Calendar", connected: true, icon: "📅", description: "Interview scheduling" },
    { name: "Slack", connected: false, icon: "💬", description: "Team notifications" },
    { name: "Notion", connected: false, icon: "📝", description: "Note synchronization" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Settings
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-transparent rounded-full mt-2"></div>
        </h1>
        <p className="text-muted-foreground">Manage your preferences and account settings</p>
      </div>

      {/* Profile & Account */}
      <Collapsible open={openSections.profile} onOpenChange={() => toggleSection('profile')}>
        <Card className="gradient-card border-border/50 shadow-elegant hover:shadow-lg transition-all duration-300">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  Profile & Account
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-primary transition-transform duration-200 ${
                    openSections.profile ? 'rotate-180' : ''
                  }`} 
                />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-primary/20 hover:border-primary/50 transition-colors glow-teal">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                    AJ
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="border-primary/30 hover:border-primary/50 hover:bg-primary/5">
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Recommended: Square image, at least 400x400px
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Password</Label>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-secondary/30 text-secondary hover:bg-secondary/10 hover:border-secondary/50"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="glow-teal">
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Notifications */}
      <Collapsible open={openSections.notifications} onOpenChange={() => toggleSection('notifications')}>
        <Card className="gradient-card border-border/50 shadow-elegant hover:shadow-lg transition-all duration-300">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-primary transition-transform duration-200 ${
                    openSections.notifications ? 'rotate-180' : ''
                  }`} 
                />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:border-border/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {key === 'emailUpdates' && <Mail className="w-4 h-4 text-muted-foreground" />}
                    {key === 'browserNotifications' && <Smartphone className="w-4 h-4 text-muted-foreground" />}
                    {key === 'weeklyDigest' && <Calendar className="w-4 h-4 text-muted-foreground" />}
                    {key === 'interviewReminders' && <Bell className="w-4 h-4 text-muted-foreground" />}
                    {key === 'applicationDeadlines' && <AlertTriangle className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {key === 'emailUpdates' && 'Email Updates'}
                        {key === 'browserNotifications' && 'Browser Notifications'}
                        {key === 'weeklyDigest' && 'Weekly Digest'}
                        {key === 'interviewReminders' && 'Interview Reminders'}
                        {key === 'applicationDeadlines' && 'Application Deadlines'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {key === 'emailUpdates' && 'Receive updates about your applications'}
                        {key === 'browserNotifications' && 'Get notified in your browser'}
                        {key === 'weeklyDigest' && 'Weekly summary of your progress'}
                        {key === 'interviewReminders' && 'Reminders for upcoming interviews'}
                        {key === 'applicationDeadlines' && 'Alerts for application deadlines'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Appearance */}
      <Collapsible open={openSections.appearance} onOpenChange={() => toggleSection('appearance')}>
        <Card className="gradient-card border-border/50 shadow-elegant hover:shadow-lg transition-all duration-300">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-primary" />
                  Appearance
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-primary transition-transform duration-200 ${
                    openSections.appearance ? 'rotate-180' : ''
                  }`} 
                />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div>
                <Label className="text-foreground mb-3 block">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['Auto', 'Dark', 'Light'].map((theme) => (
                    <Button
                      key={theme}
                      variant={theme === 'Dark' ? 'default' : 'outline'}
                      className={`justify-start ${
                        theme === 'Dark' ? 'glow-teal' : 'border-border/50 hover:border-primary/30'
                      }`}
                    >
                      {theme === 'Auto' && <Eye className="w-4 h-4 mr-2" />}
                      {theme === 'Dark' && <Palette className="w-4 h-4 mr-2" />}
                      {theme === 'Light' && <Palette className="w-4 h-4 mr-2" />}
                      {theme}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Accent Colors */}
              <div>
                <Label className="text-foreground mb-3 block">Accent Colors</Label>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-primary/50 bg-primary/10">
                    <div className="w-6 h-6 rounded-full bg-primary border-2 border-background shadow-lg"></div>
                    <span className="text-sm text-foreground">Teal</span>
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 hover:border-secondary/50 transition-colors cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-secondary border-2 border-background shadow-lg"></div>
                    <span className="text-sm text-foreground">Orange</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Integrations */}
      <Collapsible open={openSections.integrations} onOpenChange={() => toggleSection('integrations')}>
        <Card className="gradient-card border-border/50 shadow-elegant hover:shadow-lg transition-all duration-300">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link className="w-5 h-5 text-primary" />
                  Integrations
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-primary transition-transform duration-200 ${
                    openSections.integrations ? 'rotate-180' : ''
                  }`} 
                />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {integrations.map((integration, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:border-border/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{integration.icon}</div>
                    <div>
                      <p className="font-medium text-foreground">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {integration.connected && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Connected
                      </Badge>
                    )}
                    <Button
                      variant={integration.connected ? "outline" : "default"}
                      size="sm"
                      className={integration.connected 
                        ? "border-secondary/50 text-secondary hover:bg-secondary/10" 
                        : "glow-teal"
                      }
                    >
                      {integration.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Data & Privacy */}
      <Collapsible open={openSections.privacy} onOpenChange={() => toggleSection('privacy')}>
        <Card className="gradient-card border-border/50 shadow-elegant hover:shadow-lg transition-all duration-300">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  Data & Privacy
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-primary transition-transform duration-200 ${
                    openSections.privacy ? 'rotate-180' : ''
                  }`} 
                />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Download My Data</p>
                      <p className="text-sm text-muted-foreground">Export all your application data</p>
                    </div>
                    <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-secondary/30 bg-secondary/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-secondary" />
                        Delete Account
                      </p>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10 glow-orange">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
