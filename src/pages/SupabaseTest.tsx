import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Minimal UI for feedback
export default function SupabaseTest() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const testSupabase = async () => {
      setStatus('Checking authentication...');
      setError(null);
      setResults(null);
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session || !session.user) throw new Error('No authenticated user found. Please sign in.');
        const user_id = session.user.id;
        setStatus('Authenticated! Testing read...');

        // 1. Test READ
        const { data: readData, error: readError } = await supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', user_id)
          .limit(5);
        if (readError) throw readError;
        console.log('Read result:', readData);
        setStatus('Read successful! Testing write...');

        // 2. Test WRITE (insert dummy row)
        const dummy = {
          user_id,
          title: 'Test Application',
          company: 'Test Company',
          platform: 'Test Platform',
          description: 'This is a test entry from SupabaseTest.tsx',
          status: 'Applied',
          referral: null,
          hr_contact: null,
          date_applied: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
          created_at: new Date().toISOString(),
          notes: 'Test note',
          location: 'Test City',
          salary: 12345.67,
        };
        const { data: writeData, error: writeError } = await supabase
          .from('job_applications')
          .insert([dummy])
          .select();
        if (writeError) throw writeError;
        console.log('Write result:', writeData);
        setStatus('Write successful!');
        setResults({ read: readData, write: writeData });
      } catch (err: any) {
        setError(err.message || String(err));
        setStatus('Error!');
        console.error('Supabase test error:', err);
      }
    };
    testSupabase();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>Supabase Connectivity Test</h2>
      <p>Status: <b>{status}</b></p>
      {error && <pre style={{ color: 'red' }}>Error: {error}</pre>}
      {results && (
        <div>
          <h4>Read Result (first 5):</h4>
          <pre>{JSON.stringify(results.read, null, 2)}</pre>
          <h4>Write Result:</h4>
          <pre>{JSON.stringify(results.write, null, 2)}</pre>
        </div>
      )}
      <p>Check the browser console for full logs and errors.</p>
    </div>
  );
} 