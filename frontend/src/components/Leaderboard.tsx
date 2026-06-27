import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface LeaderboardEntry {
  username: string;
  currentChapter: number;
  playtimeSeconds: number;
  trophiesCount: number;
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  token: string | null;
}

export function Leaderboard({ isOpen, onClose, storyId, token }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !storyId || !token) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/game/leaderboard?storyId=${storyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('No se pudo obtener la tabla de posiciones.');
        }
        const data = await response.json();
        setEntries(data.leaderboard || []);
      } catch (err: any) {
        setError(err.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isOpen, storyId, token]);

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

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        className="glass-panel"
        style={styles.drawer}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div style={styles.titleContainer}>
            <Icons.Trophy size={20} color="var(--accent-gold)" style={{ marginRight: '8px' }} />
            <h3 className="cinzel-title" style={styles.title}>
              RANKING DE EXPLORADORES
            </h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <Icons.X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {loading ? (
            <div style={styles.centerContainer}>
              <Icons.Loader className="effect-flicker" size={24} color="var(--accent-teal)" />
              <span style={styles.infoText}>Cargando registros...</span>
            </div>
          ) : error ? (
            <div style={styles.centerContainer}>
              <Icons.AlertTriangle size={24} color="var(--accent-red)" />
              <span style={{ ...styles.infoText, color: 'var(--accent-red)' }}>{error}</span>
            </div>
          ) : entries.length === 0 ? (
            <div style={styles.centerContainer}>
              <Icons.Inbox size={24} color="var(--text-secondary)" />
              <span style={styles.infoText}>No hay registros todavía.</span>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={{ ...styles.th, width: '60px' }}>Puesto</th>
                    <th style={styles.th}>Jugador</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Cap.</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Tiempo</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Logros</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => {
                    const rank = index + 1;
                    const isTopThree = rank <= 3;
                    
                    let rankDisplay = <span>{rank}</span>;
                    if (rank === 1) rankDisplay = <span title="1er Puesto" style={{ fontSize: '1.25rem' }}>🥇</span>;
                    if (rank === 2) rankDisplay = <span title="2do Puesto" style={{ fontSize: '1.25rem' }}>🥈</span>;
                    if (rank === 3) rankDisplay = <span title="3er Puesto" style={{ fontSize: '1.25rem' }}>🥉</span>;

                    return (
                      <tr
                        key={entry.username}
                        style={{
                          ...styles.tbodyRow,
                          background: isTopThree ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                        }}
                      >
                        <td style={{ ...styles.td, fontWeight: 'bold', color: isTopThree ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                          {rankDisplay}
                        </td>
                        <td style={{ ...styles.td, fontWeight: '650' }}>
                          {entry.username}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                          {entry.currentChapter}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {formatPlaytime(entry.playtimeSeconds)}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                          🏆 {entry.trophiesCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: '100%',
    maxWidth: '520px',
    height: '100%',
    borderRadius: '0px',
    borderLeft: '1px solid var(--border-color)',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column' as const,
    animation: 'slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '15px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    letterSpacing: '0.5px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    outline: 'none',
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flex: 1,
    padding: '40px 0',
  },
  infoText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    textAlign: 'left' as const,
  },
  theadRow: {
    borderBottom: '1px solid var(--border-color)',
  },
  th: {
    padding: '12px 8px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    fontWeight: 'normal',
    letterSpacing: '0.5px',
  },
  tbodyRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background 0.2s ease',
  },
  td: {
    padding: '14px 8px',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  },
};
