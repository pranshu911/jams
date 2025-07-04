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
import React from "react";

export function TopHeader() {
  const navigate = useNavigate();
  const { session, supabase } = useSupabase();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

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
    <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-lg px-4 md:px-6 flex flex-col md:flex-row md:items-center md:h-16 w-full">
      {/* Top row: Logo and hamburger on mobile */}
      <div className="flex items-center justify-between w-full md:w-auto h-16 md:h-full">
        <div className="flex-none flex items-center h-full">
          <img src="/img/jams-logo.png" alt="JAMS Logo" className="h-12 w-auto md:h-full mr-4 md:mr-6" />
        </div>
        {/* Hamburger menu for mobile */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      {/* Navigation links */}
      <nav
        className={`w-full md:w-auto ${mobileNavOpen ? 'flex' : 'hidden'} flex-col md:flex md:flex-row md:justify-center md:items-center bg-card/95 md:bg-transparent z-30 md:static absolute left-0 top-16 md:top-0 border-b md:border-0 border-border md:gap-x-8 gap-y-2 md:gap-y-0 transition-all duration-200`}
      >
        <ul className="flex flex-col md:flex-row w-full md:w-auto items-center md:gap-x-8 gap-y-2 md:gap-y-0 py-4 md:py-0">
          <li><NavLink to="/" className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}>Dashboard</NavLink></li>
          <li><NavLink to="/applications" className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}>Applications</NavLink></li>
          <li><NavLink to="/calendar" className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}>Calendar</NavLink></li>
          <li><NavLink to="/analytics" className={({ isActive }) => isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}>Analytics</NavLink></li>
        </ul>
      </nav>
      {/* Profile Dropdown - always right-aligned */}
      <div className="flex items-center gap-x-4 flex-none min-w-0 justify-end ml-auto mt-2 md:mt-0">
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
