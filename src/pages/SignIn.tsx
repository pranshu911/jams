import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import AuthForm from '@/components/auth/AuthForm';

type LocationState = {
  from?: {
    pathname: string;
  };
};

const SignIn = () => {
  const { session } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState)?.from?.pathname || '/';

  useEffect(() => {
    if (session) {
      navigate(from, { replace: true });
    }
  }, [session, navigate, from]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AuthForm type="signin" />
    </div>
  );
};

export default SignIn;
