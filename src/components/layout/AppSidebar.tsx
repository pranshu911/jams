import { 
  BarChart3, 
  Calendar, 
  Home, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  useSidebar,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/contexts/SupabaseContext";
import { toast } from "sonner";

const UserProfile = () => {
  const { session, supabase } = useSupabase();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Successfully signed out');
      navigate('/signin');
    } catch (error: any) {
      toast.error('Error signing out: ' + error.message);
    }
  };

  if (!session) return null;

  return (
    <div className="w-full">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={isCollapsed ? 'icon' : 'default'}
            className={`w-full justify-start ${isCollapsed ? 'px-0' : 'px-3'}`}
            onClick={handleSignOut}
          >
            {isCollapsed ? (
              <LogOut className="h-5 w-5" />
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </>
            )}
          </Button>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" sideOffset={10} className="bg-gray-800 text-white text-xs">
            Sign out
          </TooltipContent>
        )}
      </Tooltip>
      
      {!isCollapsed && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center px-2 py-1 text-sm text-gray-600">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span className="truncate">{session.user?.email}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar 
      className="border-r border-gray-200 flex flex-col"
      collapsible="icon"
      style={{
        '--sidebar-width': '9.6rem',
        '--sidebar-width-icon': '4rem',
      } as React.CSSProperties}
    >
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex justify-end">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="font-medium">
                          {item.name}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" sideOffset={10} className="bg-gray-800 text-white text-xs">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-gray-200 mt-auto">
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
