import { useState, useEffect, useCallback } from 'react';
import { useSession } from './useSession';
import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface Application {
  id: number;
  title: string;
  company: string;
  date_applied: string;
  status: string;
  platform: string;
  last_updated: string;
  location?: string;
  ctc?: string;
  referral?: string;
  hr_contact?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_archive?: boolean;
}

export function useApplications() {
  const { session } = useSession();
  const [data, setData] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApplications = useCallback(async () => {
    console.log('Fetching applications...');
    console.log('Session user ID:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Querying Supabase for user ID:', session.user.id);
      const { data: applications, error: fetchError, status } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date_applied', { ascending: false });

      console.log('Supabase query status:', status);
      
      if (fetchError) {
        console.error('Supabase query error:', fetchError);
        throw fetchError;
      }

      // Ensure the data matches the Application type
      const typedApplications = (applications || []) as unknown as Application[];
      console.log('Fetched applications:', typedApplications);
      setData(typedApplications);
    } catch (err) {
      console.error('Error in fetchApplications:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch applications'));
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    console.log('useEffect in useApplications triggered');
    fetchApplications();
    
    // Set up a listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchApplications();
      }
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchApplications]);

  const refresh = useCallback(() => {
    return fetchApplications();
  }, [fetchApplications]);

  return { data, isLoading, error, refresh };
}
