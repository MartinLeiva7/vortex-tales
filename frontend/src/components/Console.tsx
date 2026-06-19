import { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

export interface StoryNodeData {
  text: string;
  ambient_sound?: string;
  visual_effect: 'none' | 'flicker' | 'shake' | 'red_flash' | 'fade_to_black';
  is_death_node: boolean;
  checkpoint: boolean;
  options: { text: string; next_node_id: string }[];
}

interface ConsoleProps {
  currentChapter: number;
  playtimeSeconds: number;
  node: StoryNodeData;
  onNavigate: (nextNodeId: string) => Promise<void>;
  onOpenTrophyRoom: () => void;
  onExit: () => void;
  loading: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Console({
  currentChapter,
  playtimeSeconds,
  node,
  onNavigate,
  onOpenTrophyRoom,
  onExit,
  loading,
  theme,
  onToggleTheme,
}: ConsoleProps) {
  const { playTrack } = useAudio();
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [activeEffect, setActiveEffect] = useState<'none' | 'flicker' | 'shake' | 'red_flash' | 'fade_to_black'>('none');
  const typingTimerRef = useRef<any>(null);

  // Play ambient audio loop whenever the sound path changes
  useEffect(() => {
    playTrack(node.ambient_sound);
  }, [node.ambient_sound]);

  // Handle transient and persistent visual effects
  useEffect(() => {
    setActiveEffect(node.visual_effect);
    
    // If the effect is transient (like a shake or red flash), reset it to none after 1 second
    if (node.visual_effect === 'shake' || node.visual_effect === 'red_flash') {
      const timer = setTimeout(() => {
        setActiveEffect('none');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [node.text, node.visual_effect]);

  // Typewriter printing effect
  useEffect(() => {
    setDisplayedText('');
    setIsTypingComplete(false);

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }

    const textToType = node.text;
    let index = 0;
    const speed = 25; // 25ms per character

    typingTimerRef.current = setInterval(() => {
      setDisplayedText((prev) => prev + textToType.charAt(index));
      index++;

      if (index >= textToType.length) {
        clearInterval(typingTimerRef.current);
        setIsTypingComplete(true);
      }
    }, speed);

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, [node.text]);

  // Skip typewriter on click
  const handleSkipTypewriter = () => {
    if (!isTypingComplete) {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
      setDisplayedText(node.text);
      setIsTypingComplete(true);
      playSynthTick();
    }
  };

  // Web Audio Synthesized cinematic pulse on option click
  const playSynthSelect = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime); // Low ominous thud
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } catch (e) {
      // Audio context blocked
    }
  };

  // Web Audio Synthesized light tick on skip
  const playSynthTick = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  };

  const handleOptionClick = async (nextNodeId: string) => {
    if (loading) return;
    playSynthSelect();
    await onNavigate(nextNodeId);
  };

  // Playtime formatting utility (HH:MM:SS)
  const formatPlaytime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (num: number) => String(num).padStart(2, '0');
    
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Get active CSS classes based on current effects
  const getConsoleClassName = () => {
    let classes = 'glass-panel';
    if (activeEffect === 'flicker') classes += ' effect-flicker';
    if (activeEffect === 'shake') classes += ' effect-shake';
    if (activeEffect === 'red_flash') classes += ' effect-red_flash';
    if (activeEffect === 'fade_to_black') classes += ' effect-fade_to_black';
    return classes;
  };

  return (
    <div style={styles.container} className={activeEffect === 'red_flash' ? 'effect-red_flash' : ''}>
      {/* Top Navbar */}
      <header style={styles.navbar}>
        <div style={styles.navLeft}>
          <button style={styles.iconBtn} onClick={onExit} title="Salir al Menú">
            <Icons.ChevronLeft size={18} />
            <span style={styles.btnText}>Menú</span>
          </button>
        </div>
        
        <div style={styles.navCenter}>
          <span style={styles.chapterBadge}>
            CAPÍTULO {currentChapter}
          </span>
        </div>
        
        <div style={styles.navRight}>
          <button style={styles.themeToggleBtn} onClick={onToggleTheme} title="Cambiar Tema">
            {theme === 'dark' ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
          </button>
          
          <div style={styles.statContainer} title="Tiempo de juego">
            <Icons.Clock size={14} color="var(--text-secondary)" />
            <span className="mono-stats" style={styles.statValue}>
              {formatPlaytime(playtimeSeconds)}
            </span>
          </div>
          
          <button style={styles.trophyBtn} onClick={onOpenTrophyRoom} title="Sala de Trofeos">
            <Icons.Award size={18} color="var(--accent-gold)" />
            <span style={{ ...styles.btnText, color: 'var(--accent-gold)' }}>Logros</span>
          </button>
        </div>
      </header>

      {/* Narrative Console */}
      <main style={styles.consoleWrapper}>
        <div className={getConsoleClassName()} style={styles.consoleCard} onClick={handleSkipTypewriter}>
          {/* Decorative console borders */}
          <div style={styles.borderCornerTopLeft}></div>
          <div style={styles.borderCornerTopRight}></div>
          <div style={styles.borderCornerBottomLeft}></div>
          <div style={styles.borderCornerBottomRight}></div>
          
          <div style={styles.narrativeArea}>
            <p className={!isTypingComplete ? 'typewriter-cursor' : ''} style={styles.narrativeText}>
              {displayedText}
            </p>
          </div>
          
          {/* Interaction Area */}
          <div style={styles.optionsArea}>
            {loading ? (
              <div style={styles.loaderContainer}>
                <Icons.Loader className="effect-flicker" size={24} color="var(--accent-teal)" />
                <span style={styles.loadingText}>Conectando con el Vórtice...</span>
              </div>
            ) : isTypingComplete ? (
              <div style={styles.optionsContainer}>
                {node.checkpoint ? (
                  // Checkpoint button
                  <button
                    className="glow-btn"
                    onClick={() => handleOptionClick('next_chapter')}
                    style={styles.checkpointBtn}
                  >
                    <Icons.TrendingUp size={16} style={{ marginRight: '8px' }} />
                    Avanzar al Siguiente Capítulo
                  </button>
                ) : node.is_death_node ? (
                  // Death Node retry
                  <button
                    className="glow-btn glow-btn-red"
                    onClick={() => handleOptionClick('c1_inicio')} // Fallback start
                    style={styles.deathBtn}
                  >
                    <Icons.RefreshCw size={16} style={{ marginRight: '8px' }} />
                    Despertar del Bucle (Reintentar)
                  </button>
                ) : (
                  // Standard story options
                  node.options.map((opt, i) => (
                    <button
                      key={i}
                      className="glow-btn"
                      onClick={() => handleOptionClick(opt.next_node_id)}
                      style={styles.optionBtn}
                    >
                      <span style={styles.optionIndex}>0{i + 1}.</span> {opt.text}
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div style={styles.skipHint}>
                <span>Haz clic en la pantalla para revelar el texto</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'var(--bg-primary)',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 30px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    zIndex: 10,
  },
  navLeft: {
    display: 'flex',
    gap: '10px',
  },
  navCenter: {},
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
  },
  themeToggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    outline: 'none',
  },
  chapterBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    letterSpacing: '2px',
    background: 'rgba(255, 51, 102, 0.1)',
    border: '1px solid rgba(255, 51, 102, 0.3)',
    color: 'var(--accent-red)',
    padding: '4px 12px',
    borderRadius: '4px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
  },
  trophyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
  },
  btnText: {
    letterSpacing: '0.5px',
  },
  statContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statValue: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    letterSpacing: '0.5px',
  },
  consoleWrapper: {
    flex: 1,
    padding: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto',
  },
  consoleCard: {
    width: '100%',
    height: '100%',
    maxHeight: '620px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  /* Decorative UI ticks */
  borderCornerTopLeft: {
    position: 'absolute' as const,
    top: '-1px',
    left: '-1px',
    width: '16px',
    height: '16px',
    borderTop: '2px solid var(--accent-teal)',
    borderLeft: '2px solid var(--accent-teal)',
  },
  borderCornerTopRight: {
    position: 'absolute' as const,
    top: '-1px',
    right: '-1px',
    width: '16px',
    height: '16px',
    borderTop: '2px solid var(--accent-teal)',
    borderRight: '2px solid var(--accent-teal)',
  },
  borderCornerBottomLeft: {
    position: 'absolute' as const,
    bottom: '-1px',
    left: '-1px',
    width: '16px',
    height: '16px',
    borderBottom: '2px solid var(--accent-teal)',
    borderLeft: '2px solid var(--accent-teal)',
  },
  borderCornerBottomRight: {
    position: 'absolute' as const,
    bottom: '-1px',
    right: '-1px',
    width: '16px',
    height: '16px',
    borderBottom: '2px solid var(--accent-teal)',
    borderRight: '2px solid var(--accent-teal)',
  },
  narrativeArea: {
    flex: 1,
    overflowY: 'auto' as const,
    marginBottom: '30px',
    paddingRight: '10px',
  },
  narrativeText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    lineHeight: '1.8',
    color: 'var(--text-primary)',
    whiteSpace: 'pre-line' as const,
    letterSpacing: '0.5px',
  },
  optionsArea: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '30px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    minHeight: '120px',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    width: '100%',
  },
  optionBtn: {
    width: '100%',
    textAlign: 'left' as const,
    padding: '16px 20px',
    background: 'rgba(128, 128, 128, 0.06)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '0.95rem',
    lineHeight: '1.4',
  },
  optionIndex: {
    color: 'var(--accent-teal)',
    marginRight: '10px',
    fontFamily: 'var(--font-mono)',
  },
  checkpointBtn: {
    width: '100%',
    background: 'var(--accent-teal-glow)',
    border: '1px solid var(--accent-teal)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1rem',
  },
  deathBtn: {
    width: '100%',
    background: 'var(--accent-red-glow)',
    border: '1px solid var(--accent-red)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1rem',
  },
  skipHint: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    animation: 'light-flicker 2s infinite',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
  },
  loadingText: {
    fontSize: '0.9rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
  },
};
