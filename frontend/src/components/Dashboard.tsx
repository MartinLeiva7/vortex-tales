import { Sun, Moon } from 'lucide-react';

interface DashboardProps {
  user: { id: string; username: string };
  onSelectStory: (storyId: string) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Dashboard({ user, onSelectStory, onLogout, theme, onToggleTheme }: DashboardProps) {
  const stories = [
    {
      id: 'terror-sanatorio',
      title: 'Vórtice del Silencio',
      genre: 'Terror / Suspenso Psicológico',
      description: 'Despiertas en un sanatorio mental abandonado, cubierto de sombras fluctuantes y ecos distorsionados. Cada pasillo oculta trampas mortales y secretos sobre experimentos arcanos. ¿Lograrás huir o te convertirás en parte del sanatorio?',
      duration: '15-20 min',
      difficulty: 'Media',
      accentColor: 'var(--accent-red)',
    },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <h2 className="cinzel-title" style={styles.logo}>VORTEX TALES</h2>
        </div>
        <div style={styles.userInfo}>
          <button onClick={onToggleTheme} style={styles.themeToggleBtn} title="Cambiar Tema">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <span style={styles.username}>Explorador: <strong style={{ color: 'var(--accent-teal)' }}>{user.username}</strong></span>
          <button onClick={onLogout} style={styles.logoutBtn}>Cerrar Sesión</button>
        </div>
      </header>

      <main style={styles.main}>
        <h3 className="cinzel-title" style={styles.sectionTitle}>Selecciona tu aventura</h3>
        
        <div style={styles.grid}>
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

              <button
                onClick={() => onSelectStory(story.id)}
                className="glow-btn"
                style={{
                  ...styles.playBtn,
                  border: `1px solid ${story.accentColor}aa`,
                  boxShadow: `0 0 10px ${story.accentColor}22`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = story.accentColor;
                  if (theme === 'dark') {
                    e.currentTarget.style.boxShadow = `0 0 20px ${story.accentColor}55`;
                    e.currentTarget.style.textShadow = `0 0 5px ${story.accentColor}`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${story.accentColor}aa`;
                  e.currentTarget.style.boxShadow = `0 0 10px ${story.accentColor}22`;
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                Ingresar al Vórtice
              </button>
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
};
