'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('http://localhost:41522/api/setup/status');

      if (!response.ok) {
        // If backend is not running, allow access (development mode)
        setSetupComplete(true);
        setIsChecking(false);
        return;
      }

      const data = await response.json();

      setSetupComplete(data.setupComplete);
      setIsChecking(false);

      // If setup is not complete and we're not on the setup page, redirect
      if (!data.setupComplete && pathname !== '/setup') {
        router.push('/setup');
      }

      // If setup is complete and we're on the setup page, redirect to home
      if (data.setupComplete && pathname === '/setup') {
        router.push('/');
      }
    } catch (error) {
      console.error('Setup status check failed:', error);
      // On error, allow access (assume setup is complete or backend is offline)
      setSetupComplete(true);
      setIsChecking(false);
    }
  };

  // Show loading screen while checking setup status
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  // If on setup page, always render (setup page handles its own logic)
  if (pathname === '/setup') {
    return <>{children}</>;
  }

  // If setup is complete, render children
  if (setupComplete) {
    return <>{children}</>;
  }

  // If setup is not complete and not on setup page, show loading (will redirect)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to setup...</p>
      </div>
    </div>
  );
}
