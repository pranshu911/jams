import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import NewApplication from "./pages/NewApplication";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import SupabaseProvider, { useSupabase } from "./contexts/SupabaseContext";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import SupabaseTest from "./pages/SupabaseTest";
import ArchivedApplications from "./pages/ArchivedApplications";

// Import AuthGuard
import AuthGuard from '@/components/auth/AuthGuard';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        {({ loading }) => (
          loading ? (
            <LoadingSpinner />
          ) : (
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  
                  {/* Protected routes */}
                  <Route 
                    path="/" 
                    element={
                      <AuthGuard>
                        <AppLayout />
                      </AuthGuard>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="applications" element={<Applications />} />
                    <Route path="applications/new" element={<NewApplication />} />
                    <Route path="archived-applications" element={<ArchivedApplications />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                    {/* <Route path="supabase-test" element={<SupabaseTest />} /> */}
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          )
        )}
      </SupabaseProvider>
    </QueryClientProvider>
  );
};

export default App;
