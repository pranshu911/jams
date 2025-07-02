import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type AuthGuardProps = {
  children: React.ReactNode;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { session, loading: sessionLoading } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!sessionLoading) {
      setIsLoading(false);
      
      // If there's no session and we're not on the sign-in or sign-up page, redirect to sign-in
      if (!session && !['/signin', '/signup'].includes(location.pathname)) {
        navigate('/signin', { state: { from: location }, replace: true });
      }
      
      // If there is a session and we're on the sign-in or sign-up page, redirect to home
      if (session && ['/signin', '/signup'].includes(location.pathname)) {
        navigate('/');
      }
    }
  }, [session, sessionLoading, navigate, location]);

  // Show loading spinner while checking session
  if (isLoading || sessionLoading) {
    return <LoadingSpinner />;
  }

  // If there's no session and we're not on an auth page, don't render children
  if (!session && !['/signin', '/signup'].includes(location.pathname)) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
