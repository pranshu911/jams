import { Search, Bell, User, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NavLink, useNavigate } from "react-router-dom";
import { useSupabase } from "@/contexts/SupabaseContext";

export function TopHeader() {
  const navigate = useNavigate();
  const { session, supabase } = useSupabase();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/signin');
    } catch (error: any) {
      // Optionally show a toast
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-sm border-b border-border flex items-center px-6 shadow-lg">
      {/* Logo left-aligned, full height */}
      <div className="flex-none flex items-center h-full">
        <img src="/img/jams-logo.png" alt="JAMS Logo" className="h-full w-auto mr-6" />
      </div>
      {/* Centered Navigation */}
      <nav className="flex-1 flex justify-center">
        <ul className="flex gap-x-8">
          <li><NavLink to="/" className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}>Dashboard</NavLink></li>
          <li><NavLink to="/applications" className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}>Applications</NavLink></li>
          <li><NavLink to="/calendar" className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}>Calendar</NavLink></li>
          <li><NavLink to="/analytics" className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}>Analytics</NavLink></li>
        </ul>
      </nav>
      {/* Search Bar Top Right and Profile Dropdown, right-aligned */}
      <div className="flex items-center gap-x-4 flex-none min-w-0 justify-end ml-auto">
        <div className="relative w-3/8 min-w-[120px] max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search applications..."
            className="pl-10 bg-muted/50 border-border/50 focus:bg-card focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 w-full"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 hover:bg-accent/50 rounded-xl transition-all duration-200">
              <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary/20 text-primary">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-elegant">
            <DropdownMenuItem className="hover:bg-accent/50">Profile</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-accent/50" onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-accent/50 text-destructive focus:text-destructive" onClick={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
