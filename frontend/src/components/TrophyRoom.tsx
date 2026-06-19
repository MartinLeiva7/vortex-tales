import * as Icons from 'lucide-react';

export interface Trophy {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string | null;
}

interface TrophyRoomProps {
  isOpen: boolean;
  onClose: () => void;
  trophies: Trophy[];
}

export function TrophyRoom({ isOpen, onClose, trophies }: TrophyRoomProps) {
  // Helper to render icons dynamically based on string name
  const renderIcon = (iconName: string, isUnlocked: boolean) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Award;
    return (
      <IconComponent
        size={24}
        color={isUnlocked ? 'var(--accent-gold)' : 'var(--text-muted)'}
        style={{
          filter: isUnlocked ? 'drop-shadow(0 0 4px var(--accent-gold-glow))' : 'none',
        }}
      />
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
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
          <h3 className="cinzel-title" style={styles.title}>
            SALA DE TROFEOS
          </h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <Icons.X size={20} />
          </button>
        </div>

        <div style={styles.stats}>
          <span style={styles.statsText}>
            Desbloqueados:{' '}
            <strong style={{ color: 'var(--accent-gold)' }}>
              {trophies.filter((t) => t.unlocked).length} / {trophies.length}
            </strong>
          </span>
        </div>

        <div style={styles.list}>
          {trophies.map((trophy) => (
            <div
              key={trophy.id}
              style={{
                ...styles.item,
                borderColor: trophy.unlocked
                  ? 'rgba(255, 200, 55, 0.2)'
                  : 'var(--border-color)',
                background: trophy.unlocked
                  ? 'rgba(255, 200, 55, 0.02)'
                  : 'rgba(0, 0, 0, 0.2)',
              }}
            >
              <div
                style={{
                  ...styles.iconWrapper,
                  borderColor: trophy.unlocked
                    ? 'var(--accent-gold)'
                    : 'var(--border-color)',
                }}
              >
                {renderIcon(trophy.icon, trophy.unlocked)}
              </div>

              <div style={styles.details}>
                <h4
                  style={{
                    ...styles.trophyTitle,
                    color: trophy.unlocked ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {trophy.title}
                </h4>
                <p style={styles.trophyDesc}>{trophy.description}</p>
                {trophy.unlocked && trophy.unlockedAt && (
                  <span style={styles.unlockDate}>
                    Desbloqueado: {formatDate(trophy.unlockedAt)}
                  </span>
                )}
              </div>

              {!trophy.unlocked && (
                <div style={styles.lockIcon}>
                  <Icons.Lock size={14} color="var(--text-muted)" />
                </div>
              )}
            </div>
          ))}
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
    maxWidth: '420px',
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
  title: {
    fontSize: '1.4rem',
    color: '#fff',
    textShadow: '0 0 8px rgba(255, 200, 55, 0.2)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    outline: 'none',
  },
  stats: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    marginBottom: '20px',
    color: 'var(--text-secondary)',
  },
  statsText: {
    letterSpacing: '0.5px',
  },
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    paddingRight: '5px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    position: 'relative' as const,
    gap: '16px',
    transition: 'var(--transition-smooth)',
  },
  iconWrapper: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    border: '1px solid',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.3)',
    flexShrink: 0,
  },
  details: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
  },
  trophyTitle: {
    fontSize: '0.95rem',
    fontWeight: '650',
  },
  trophyDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  unlockDate: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-gold)',
    marginTop: '2px',
  },
  lockIcon: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
  },
};
