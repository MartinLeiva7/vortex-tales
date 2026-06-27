import { useEffect } from 'react';
import * as Icons from 'lucide-react';

interface NotificationProps {
  trophy: {
    id: string;
    title: string;
    description: string;
    icon: string;
  } | null;
  onClear: () => void;
}

export function Notification({ trophy, onClear }: NotificationProps) {
  useEffect(() => {
    if (!trophy) return;

    // Auto-clear notification after 4.5 seconds
    const timer = setTimeout(() => {
      onClear();
    }, 4500);

    return () => clearTimeout(timer);
  }, [trophy, onClear]);

  if (!trophy) return null;

  const IconComponent = (Icons as any)[trophy.icon] || Icons.Award;

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.toast}>
        <div style={styles.header}>
          <Icons.Award size={16} color="var(--accent-gold)" />
          <span style={styles.headerText}>¡LOGRO DESBLOQUEADO!</span>
          <button 
            onClick={onClear} 
            style={styles.closeBtn} 
            title="Cerrar"
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
          >
            <Icons.X size={14} />
          </button>
        </div>
        <div style={styles.body}>
          <div style={styles.iconWrapper}>
            <IconComponent size={22} color="var(--accent-gold)" />
          </div>
          <div style={styles.details}>
            <h4 style={styles.title}>{trophy.title}</h4>
            <p style={styles.desc}>{trophy.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed' as const,
    top: '20px',
    right: '20px',
    zIndex: 9999,
    width: '100%',
    maxWidth: '340px',
    animation: 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  toast: {
    padding: '16px',
    border: '1px solid var(--accent-gold)',
    boxShadow: '0 4px 20px rgba(255, 200, 55, 0.15)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    background: 'rgba(15, 12, 5, 0.95)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
  },
  headerText: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-gold)',
    letterSpacing: '1px',
    fontWeight: 'bold',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-gold)',
    opacity: 0.6,
    cursor: 'pointer',
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    transition: 'opacity 0.2s',
    outline: 'none',
  },
  body: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  iconWrapper: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '1px solid rgba(255, 200, 55, 0.3)',
    background: 'rgba(255, 200, 55, 0.05)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  details: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  desc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.3',
  },
};
