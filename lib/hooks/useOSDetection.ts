import { useState, useEffect } from 'react';

export type OS = 'windows' | 'mac' | 'other';

export function useOSDetection(): OS {
  const [os, setOS] = useState<OS>('windows'); // Default to windows

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('mac')) {
      setOS('mac');
    } else if (userAgent.includes('win')) {
      setOS('windows');
    } else {
      setOS('other');
    }
  }, []);

  return os;
}