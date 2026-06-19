import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Console } from './components/Console';
import type { StoryNodeData } from './components/Console';
import { TrophyRoom } from './components/TrophyRoom';
import type { Trophy } from './components/TrophyRoom';
import { Notification } from './components/Notification';
import { usePlaytime } from './hooks/usePlaytime';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  username: string;
}

interface GameState {
  storyId: string;
  currentChapter: number;
  currentNodeId: string;
  playtimeSeconds: number;
  node: StoryNodeData;
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [isTrophyRoomOpen, setIsTrophyRoomOpen] = useState(false);
  const [unlockedTrophy, setUnlockedTrophy] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  // Toggle class on root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync playtime ticking locally and push increments to backend
  const tickingPlaytime = usePlaytime(
    activeStoryId,
    token,
    gameState?.playtimeSeconds || 0
  );

  // Validate session on load
  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (err) {
        console.error('Failed to validate session:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    validateSession();
  }, [token]);

  const handleAuthSuccess = (newToken: string, authenticatedUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setActiveStoryId(null);
    setGameState(null);
  };

  const handleSelectStory = async (storyId: string) => {
    setLoading(true);
    setActiveStoryId(storyId);

    try {
      // 1. Load or Initialize Game State
      const response = await fetch(`${API_BASE}/api/game/state?storyId=${storyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load game state.');
      }

      const stateData = await response.json();
      setGameState(stateData);

      // 2. Load Trophies list
      await fetchTrophies(storyId);
    } catch (err) {
      console.error(err);
      setActiveStoryId(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrophies = async (storyId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/game/trophies?storyId=${storyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrophies(data.trophies);
      }
    } catch (err) {
      console.error('Failed to load trophies:', err);
    }
  };

  const handleNavigate = async (nextNodeId: string) => {
    if (!activeStoryId || !token) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/game/navigate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storyId: activeStoryId,
          nextNodeId,
        }),
      });

      if (!response.ok) {
        throw new Error('Navigation failed.');
      }

      const data = await response.json();

      if (data.storyEnded) {
        alert(data.message);
        // Reset state and return to dashboard
        setGameState(null);
        setActiveStoryId(null);
        return;
      }

      // Update local game state
      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentChapter: data.currentChapter,
          currentNodeId: data.currentNodeId,
          node: data.node,
          playtimeSeconds: tickingPlaytime, // Preserves ticking count
        };
      });

      // Handle trophy unlock notification
      if (data.unlockedTrophy) {
        setUnlockedTrophy(data.unlockedTrophy);
        // Refresh trophies drawer list
        await fetchTrophies(activeStoryId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTrophyRoom = async () => {
    if (activeStoryId) {
      await fetchTrophies(activeStoryId);
    }
    setIsTrophyRoomOpen(true);
  };

  if (authLoading) {
    return (
      <div style={styles.loadingContainer}>
        <span className="effect-flicker" style={styles.loadingText}>
          Sintonizando la Frecuencia...
        </span>
      </div>
    );
  }

  // Router view selector
  return (
    <>
      {!user ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : !activeStoryId || !gameState ? (
        <Dashboard
          user={user}
          onSelectStory={handleSelectStory}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        />
      ) : (
        <Console
          currentChapter={gameState.currentChapter}
          playtimeSeconds={tickingPlaytime}
          node={gameState.node}
          onNavigate={handleNavigate}
          onOpenTrophyRoom={handleOpenTrophyRoom}
          onExit={() => {
            setActiveStoryId(null);
            setGameState(null);
          }}
          loading={loading}
          theme={theme}
          onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        />
      )}

      {/* Trophies Overlay drawer */}
      <TrophyRoom
        isOpen={isTrophyRoomOpen}
        onClose={() => setIsTrophyRoomOpen(false)}
        trophies={trophies}
      />

      {/* Achievement Unlocked Toast Notification */}
      <Notification
        trophy={unlockedTrophy}
        onClear={() => setUnlockedTrophy(null)}
      />
    </>
  );
}

const styles = {
  loadingContainer: {
    height: '100vh',
    background: '#07090e',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-teal)',
    fontSize: '1rem',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
  },
};
