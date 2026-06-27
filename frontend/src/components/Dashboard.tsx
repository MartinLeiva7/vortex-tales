import { useEffect } from 'react';
import { Sun, Moon, Trophy, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface DashboardProps {
  user: { id: string; username: string };
  onSelectStory: (storyId: string) => void;
  onRestartStory?: (storyId: string) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  stats: {
    currentChapter: number;
    playtimeSeconds: number;
    unlockedTrophiesCount: number;
    totalTrophiesCount: number;
  } | null;
  onOpenLeaderboard: (storyId: string) => void;
}

export function Dashboard({ user, onSelectStory, onRestartStory, onLogout, theme, onToggleTheme, stats, onOpenLeaderboard }: DashboardProps) {
  const { playTrack, stopAudio, toggleMute, isMuted } = useAudio();

  useEffect(() => {
    playTrack('audio/shared/menu_ambient.mp3');
    return () => {
      stopAudio();
    };
  }, []);

  const formatPlaytime = (totalSeconds: number) => {
    const seconds = Math.max(0, totalSeconds);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (num: number) => String(num).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const stories = [
    {
      id: 'terror-sanatorio',
      title: 'Vórtice del Silencio',
      genre: 'Terror / Suspenso Psicológico',
      description: 'Despiertas en un sanatorio mental abandonado, cubierto de sombras fluctuantes y ecos distorsionados. Cada pasillo oculta trampas mortales y secretos sobre experimentos arcanos. ¿Lograrás huir o te convertirás en parte del sanatorio?',
      duration: '15-20 min',
      difficulty: 'Media',
      accentColor: 'var(--accent-red)',
      upcoming: false,
    },
    {
      id: 'detectivesco-noir',
      title: 'Ecos de Baker Street',
      genre: 'Policial / Misterio Noir',
      description: 'Una misteriosa niebla cubre Londres. La desaparición de un renombrado historiador en condiciones imposibles despierta la alarma de Scotland Yard. Deberás descifrar pistas crípticas e interrogar a sospechosos astutos en un juego de lógica pura.',
      duration: 'En desarrollo',
      difficulty: 'Alta',
      accentColor: 'var(--accent-teal)',
      upcoming: true,
    },
  ];

  return (
    <div style={styles.container}>
      <header className="dashboard-header" style={styles.header}>
        <div style={styles.logoContainer}>
          <h2 className="cinzel-title" style={styles.logo}>VORTEX TALES</h2>
        </div>
        <div className="dashboard-user-info" style={styles.userInfo}>
          <button onClick={toggleMute} style={styles.themeToggleBtn} title={isMuted ? "Activar Música" : "Silenciar Música"}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button onClick={onToggleTheme} style={styles.themeToggleBtn} title="Cambiar Tema">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <span className="dashboard-username" style={styles.username}>Explorador: <strong style={{ color: 'var(--accent-teal)' }}>{user.username}</strong></span>
          <button onClick={onLogout} style={styles.logoutBtn}>Cerrar Sesión</button>
        </div>
      </header>

      <main className="dashboard-main" style={styles.main}>
        <h3 className="cinzel-title" style={styles.sectionTitle}>Selecciona tu aventura</h3>
        
        <div className="dashboard-grid" style={styles.grid}>
          {stories.map((story) => (
            <div
              key={story.id}
              className="glass-panel"
              style={{
                ...styles.card,
                border: `1px solid ${story.accentColor}33`,
              }}
            >
              <div style={styles.genreTag}>{story.genre}</div>
              <h4 className="cinzel-title" style={styles.cardTitle}>{story.title}</h4>
              <p style={styles.cardDesc}>{story.description}</p>
              
              <div style={styles.metaContainer}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Dificultad:</span>
                  <span style={styles.metaValue}>{story.difficulty}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Duración:</span>
                  <span style={styles.metaValue}>{story.duration}</span>
                </div>
              </div>

              {stats && !story.upcoming && (
                <div style={styles.statsContainer}>
                  <div style={styles.statsItem}>
                    <span style={styles.statsLabel}>Capítulo:</span>
                    <span style={styles.statsVal}>{stats.currentChapter} / 12</span>
                  </div>
                  <div style={styles.statsItem}>
                    <span style={styles.statsLabel}>Tiempo Jugado:</span>
                    <span style={styles.statsVal}>{formatPlaytime(stats.playtimeSeconds)}</span>
                  </div>
                  <div style={styles.statsItem}>
                    <span style={styles.statsLabel}>Logros:</span>
                    <span style={styles.statsVal}>🏆 {stats.unlockedTrophiesCount} / {stats.totalTrophiesCount}</span>
                  </div>
                </div>
              )}

              <div style={styles.actionContainer}>
                <button
                  onClick={() => !story.upcoming && onSelectStory(story.id)}
                  disabled={story.upcoming}
                  className={story.upcoming ? "glow-btn disabled" : "glow-btn"}
                  style={{
                    ...styles.playBtn,
                    border: `1px solid ${story.upcoming ? 'var(--border-color)' : story.accentColor + 'aa'}`,
                    boxShadow: story.upcoming ? 'none' : `0 0 10px ${story.accentColor}22`,
                    cursor: story.upcoming ? 'not-allowed' : 'pointer',
                    opacity: story.upcoming ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (story.upcoming) return;
                    e.currentTarget.style.borderColor = story.accentColor;
                    if (theme === 'dark') {
                      e.currentTarget.style.boxShadow = `0 0 20px ${story.accentColor}55`;
                      e.currentTarget.style.textShadow = `0 0 5px ${story.accentColor}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (story.upcoming) return;
                    e.currentTarget.style.borderColor = `${story.accentColor}aa`;
                    e.currentTarget.style.boxShadow = `0 0 10px ${story.accentColor}22`;
                    e.currentTarget.style.textShadow = 'none';
                  }}
                >
                  {story.upcoming
                    ? 'Próximamente'
                    : stats && (stats.currentChapter > 1 || stats.playtimeSeconds > 0)
                      ? `Continuar (Capítulo ${stats.currentChapter})`
                      : 'Ingresar al Vórtice'}
                </button>

                {!story.upcoming && stats && (stats.currentChapter > 1 || stats.playtimeSeconds > 0) && onRestartStory && (
                  <button
                    onClick={() => onRestartStory(story.id)}
                    className="glow-btn"
                    style={styles.restartBtn}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgb(239, 68, 68)';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.color = '#fff';
                      if (theme === 'dark') {
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                      e.currentTarget.style.color = 'rgb(248, 113, 113)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <RotateCcw size={14} style={{ marginRight: '8px' }} />
                    Reiniciar Historia
                  </button>
                )}

                {!story.upcoming && (
                  <button
                    onClick={() => onOpenLeaderboard(story.id)}
                    className="glow-btn"
                    style={styles.leaderboardBtn}
                  >
                    <Trophy size={14} style={{ marginRight: '8px' }} />
                    Ver Rankings
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(13, 17, 26, 0.4)',
  },
  logoContainer: {},
  logo: {
    fontSize: '1.5rem',
    fontWeight: '900',
    color: 'var(--text-primary)',
    textShadow: '0 0 8px rgba(0, 240, 255, 0.2)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  themeToggleBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    transition: 'var(--transition-smooth)',
  },
  username: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    padding: '6px 14px',
    borderRadius: '4px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-mono)',
    transition: 'var(--transition-smooth)',
  },
  main: {
    flex: 1,
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '60px 40px',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    marginBottom: '40px',
    color: 'var(--text-primary)',
    borderLeft: '4px solid var(--accent-red)',
    paddingLeft: '15px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '30px',
  },
  card: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    position: 'relative' as const,
    transition: 'var(--transition-smooth)',
  },
  genreTag: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-red)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '1.6rem',
    color: 'var(--text-primary)',
    marginBottom: '15px',
  },
  cardDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '25px',
    flex: 1,
  },
  metaContainer: {
    display: 'flex',
    gap: '30px',
    marginBottom: '30px',
    width: '100%',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '15px',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  metaLabel: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
  },
  metaValue: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  playBtn: {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.4)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '15px 0',
    borderTop: '1px solid var(--border-color)',
    marginBottom: '20px',
  },
  statsItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  statsLabel: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
  },
  statsVal: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: 'var(--accent-teal)',
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginTop: 'auto',
    width: '100%',
  },
  leaderboardBtn: {
    width: '100%',
    padding: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.85rem',
    cursor: 'pointer',
    border: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.02)',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
    transition: 'var(--transition-smooth)',
  },
  restartBtn: {
    width: '100%',
    padding: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.85rem',
    cursor: 'pointer',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    background: 'rgba(239, 68, 68, 0.05)',
    fontFamily: 'var(--font-mono)',
    color: 'rgb(248, 113, 113)',
    transition: 'var(--transition-smooth)',
  },
};
