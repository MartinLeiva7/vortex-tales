import { useEffect, useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function usePlaytime(storyId: string | null, token: string | null, initialPlaytime: number) {
  const [totalPlaytime, setTotalPlaytime] = useState(initialPlaytime);
  const unsyncedSecondsRef = useRef(0);

  const lastResetRef = useRef(Date.now());

  // Sync if initialPlaytime gets populated/changed by loading state
  useEffect(() => {
    setTotalPlaytime(initialPlaytime);
    unsyncedSecondsRef.current = 0;
    lastResetRef.current = Date.now();
  }, [initialPlaytime]);

  useEffect(() => {
    if (!storyId || !token) return;

    const syncPlaytime = async () => {
      const syncTime = Date.now();
      const secondsToSync = unsyncedSecondsRef.current;
      if (secondsToSync === 0) return;

      try {
        const response = await fetch(`${API_BASE}/api/game/playtime`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ storyId, seconds: secondsToSync }),
        });

        if (response.ok) {
          // Discard sync response if a reset occurred during the network call
          if (syncTime < lastResetRef.current) {
            return;
          }

          unsyncedSecondsRef.current = Math.max(0, unsyncedSecondsRef.current - secondsToSync);
          const data = await response.json();
          if (data && typeof data.playtimeSeconds === 'number') {
            // Re-sync local state with server state + any ticks accumulated since sync started
            setTotalPlaytime(Math.max(0, data.playtimeSeconds + unsyncedSecondsRef.current));
          }
        }
      } catch (err) {
        console.error('Failed to sync playtime:', err);
      }
    };

    // Increment local counter and queue sync
    const timer = setInterval(() => {
      setTotalPlaytime(prev => prev + 1);
      unsyncedSecondsRef.current += 1;

      // Sync with server every 15 seconds
      if (unsyncedSecondsRef.current >= 15) {
        syncPlaytime();
      }
    }, 1000);

    // Sync on window/tab close
    const handleBeforeUnload = () => {
      const secondsToSync = unsyncedSecondsRef.current;
      if (secondsToSync === 0) return;

      fetch(`${API_BASE}/api/game/playtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ storyId, seconds: secondsToSync }),
        keepalive: true,
      }).catch(err => {
        console.error('Failed beacon sync on unload:', err);
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Sync outstanding seconds on unmount
      syncPlaytime();
    };
  }, [storyId, token]);

  return totalPlaytime;
}
