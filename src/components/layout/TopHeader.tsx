
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
import { useSidebar } from "@/components/ui/sidebar";

export function TopHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="h-16 bg-card/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      
      <div className="hidden md:flex items-center justify-center">
        <img 
          src="/img/jams-logo.png" 
          alt="JAMS Logo" 
          className="h-12 w-auto"
        />
      </div>
      
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search applications..."
            className="pl-10 bg-muted/50 border-border/50 focus:bg-card focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative hover:bg-accent/50 rounded-xl transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full animate-pulse"></span>
        </Button>
        
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
            <DropdownMenuItem className="hover:bg-accent/50">Settings</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-accent/50 text-destructive focus:text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
