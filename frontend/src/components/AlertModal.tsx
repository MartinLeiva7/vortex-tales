import * as Icons from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'confirm';
  onClose: () => void;
  onConfirm?: () => void;
}

export function AlertModal({ isOpen, title, message, type, onClose, onConfirm }: AlertModalProps) {
  if (!isOpen) return null;

  // Decide icon and color scheme based on alert type
  let IconComponent = Icons.Info;
  let accentColor = 'var(--accent-teal)';
  let glowColor = 'rgba(0, 243, 255, 0.15)';
  let headerText = title || 'Aviso del Sistema';

  if (type === 'success') {
    IconComponent = Icons.CheckCircle;
    accentColor = 'var(--accent-teal)';
    glowColor = 'rgba(0, 243, 255, 0.2)';
  } else if (type === 'error') {
    IconComponent = Icons.AlertOctagon;
    accentColor = 'var(--accent-red)';
    glowColor = 'rgba(255, 0, 85, 0.2)';
  } else if (type === 'confirm') {
    IconComponent = Icons.AlertTriangle;
    accentColor = 'var(--accent-gold)';
    glowColor = 'rgba(255, 200, 55, 0.2)';
    headerText = title || 'Confirmar Acción';
  }

  return (
    <div style={styles.overlay}>
      <div 
        className="glass-panel effect-flicker" 
        style={{
          ...styles.modal,
          borderColor: accentColor,
          boxShadow: `0 0 30px ${glowColor}, inset 0 0 15px rgba(255, 255, 255, 0.02)`,
        }}
      >
        {/* Retro style corner accents */}
        <div style={{ ...styles.borderCornerTopLeft, borderColor: accentColor }}></div>
        <div style={{ ...styles.borderCornerTopRight, borderColor: accentColor }}></div>
        <div style={{ ...styles.borderCornerBottomLeft, borderColor: accentColor }}></div>
        <div style={{ ...styles.borderCornerBottomRight, borderColor: accentColor }}></div>

        <div style={styles.header}>
          <IconComponent size={20} color={accentColor} />
          <span style={{ ...styles.headerText, color: accentColor }}>{headerText}</span>
        </div>

        <div style={styles.body}>
          <p style={styles.messageText}>{message}</p>
        </div>

        <div style={styles.footer}>
          {type === 'confirm' ? (
            <div style={styles.confirmButtons}>
              <button 
                onClick={onClose} 
                className="glow-btn"
                style={{
                  ...styles.cancelBtn,
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }} 
                className="glow-btn"
                style={{
                  ...styles.closeBtn,
                  background: 'rgba(255, 200, 55, 0.08)',
                  borderColor: accentColor,
                }}
              >
                Confirmar
              </button>
            </div>
          ) : (
            <button 
              onClick={onClose} 
              className="glow-btn"
              style={{
                ...styles.closeBtn,
                background: type === 'error' ? 'var(--accent-red-glow)' : 'var(--accent-teal-glow)',
                borderColor: accentColor,
              }}
            >
              Aceptar
            </button>
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
    background: 'rgba(5, 5, 5, 0.85)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    animation: 'fade-in 0.25s ease-out',
  },
  modal: {
    position: 'relative' as const,
    width: '90%',
    maxWidth: '420px',
    background: 'rgba(15, 18, 20, 0.95)',
    borderRadius: '8px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    borderWidth: '1px',
    borderStyle: 'solid' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '12px',
  },
  headerText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
  },
  body: {
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
  },
  messageText: {
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    textAlign: 'center' as const,
    width: '100%',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '5px',
  },
  closeBtn: {
    padding: '10px 24px',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    minWidth: '120px',
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    width: '100%',
  },
  cancelBtn: {
    padding: '10px 24px',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    minWidth: '120px',
    cursor: 'pointer',
  },
  // Retro sci-fi corner brackets styles
  borderCornerTopLeft: {
    position: 'absolute' as const,
    top: '-1px',
    left: '-1px',
    width: '12px',
    height: '12px',
    borderLeftWidth: '2px',
    borderLeftStyle: 'solid' as const,
    borderTopWidth: '2px',
    borderTopStyle: 'solid' as const,
  },
  borderCornerTopRight: {
    position: 'absolute' as const,
    top: '-1px',
    right: '-1px',
    width: '12px',
    height: '12px',
    borderRightWidth: '2px',
    borderRightStyle: 'solid' as const,
    borderTopWidth: '2px',
    borderTopStyle: 'solid' as const,
  },
  borderCornerBottomLeft: {
    position: 'absolute' as const,
    bottom: '-1px',
    left: '-1px',
    width: '12px',
    height: '12px',
    borderLeftWidth: '2px',
    borderLeftStyle: 'solid' as const,
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid' as const,
  },
  borderCornerBottomRight: {
    position: 'absolute' as const,
    bottom: '-1px',
    right: '-1px',
    width: '12px',
    height: '12px',
    borderRightWidth: '2px',
    borderRightStyle: 'solid' as const,
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid' as const,
  },
};
