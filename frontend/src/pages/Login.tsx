import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SeaGlitter from '../components/SeaGlitter';
import './Auth.css';

interface Server {
  id: string;
  name: string;
  description?: string;
  status?: string;
  settings?: any;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverId, setServerId] = useState('');
  const [servers, setServers] = useState<Server[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingServers, setLoadingServers] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const affeImageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lade verfügbare Server
    const loadServers = async () => {
      try {
        const res = await api.get('/servers');
        const activeServers = res.data.servers.filter((s: Server) => s.status === 'active');
        setServers(activeServers);
        if (activeServers.length > 0) {
          setServerId(activeServers[0].id);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Server:', err);
      } finally {
        setLoadingServers(false);
      }
    };
    loadServers();
  }, []);

  // Position des Affe-Bilds - speichere Referenz beim ersten Laden
  useEffect(() => {
    // Speichere die initiale Bildschirmgröße als Referenz
    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;
    
    // Position in Prozent des Viewports (wo der Affe perfekt ist)
    // Diese Werte basieren auf deiner aktuellen Position
    const refTopPercent = 14.50; // Prozent vom oberen Rand
    const refLeftPercent = 68.23; // Prozent vom linken Rand
    
    // Referenz-Größe in Pixel
    const refTopPx = (refTopPercent / 100) * initialHeight;
    const refLeftPx = (refLeftPercent / 100) * initialWidth;
    const refSizePx = 0.76835 * 37.8 * 1.32; // cm zu px, 32% größer (20% + 10% = 32%)

    const updateAffePosition = () => {
      if (!affeImageRef.current || !containerRef.current) return;

      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      // Skalierungsfaktor basierend auf Viewport-Änderung
      const scaleX = currentWidth / initialWidth;
      const scaleY = currentHeight / initialHeight;

      // Verwende den kleineren Skalierungsfaktor für konsistente Größe
      const scale = Math.min(scaleX, scaleY);

      // Berechne Position (skaliert proportional zur Viewport-Änderung)
      const top = refTopPx * scaleY;
      const left = refLeftPx * scaleX;

      // Setze Position
      affeImageRef.current.style.top = `${top}px`;
      affeImageRef.current.style.left = `${left}px`;

      // Größe skalieren
      const scaledSize = refSizePx * scale;
      affeImageRef.current.style.width = `${scaledSize}px`;

      // Position wird dynamisch gesetzt
    };

    // Initial setzen
    updateAffePosition();

    // Bei Resize neu berechnen (nur bei echten Größenänderungen)
    let lastWidth = initialWidth;
    let lastHeight = initialHeight;
    let resizeTimeout: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
        
        // Nur neu berechnen, wenn sich die Größe wirklich geändert hat (nicht beim Scrollen)
        const widthChange = Math.abs(currentWidth - lastWidth);
        const heightChange = Math.abs(currentHeight - lastHeight);
        
        // Nur bei Änderung > 10px (verhindert Zucken beim Scrollen)
        if (widthChange > 10 || heightChange > 10) {
          updateAffePosition();
          lastWidth = currentWidth;
          lastHeight = currentHeight;
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Mausposition verfolgen - nur wenn Raster aktiviert ist
  useEffect(() => {
    if (!showGrid) {
      setMousePosition(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const xPercent = (e.clientX / window.innerWidth) * 100;
      const yPercent = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x: xPercent, y: yPercent });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showGrid]);

  // Leertaste zum Kopieren
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && mousePosition) {
        e.preventDefault();
        const text = `Top: ${mousePosition.y.toFixed(2)}%, Left: ${mousePosition.x.toFixed(2)}%`;
        navigator.clipboard.writeText(text);
        // Visuelles Feedback
        const btn = document.querySelector('.copy-position-button') as HTMLButtonElement;
        if (btn) {
          const originalText = btn.textContent;
          btn.textContent = 'Kopiert!';
          setTimeout(() => {
            if (btn) btn.textContent = originalText;
          }, 2000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [mousePosition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!serverId) {
      setError('Bitte wähle einen Server aus');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password, serverId });
      login(res.data.token, res.data.user, res.data.server);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler beim Login');
    } finally {
      setLoading(false);
    }
  };

  // Koordinaten für die rote Linie
  const redLinePoints = [
    { top: 47.20, left: 0.16 },
    { top: 48.04, left: 35.52 },
    { top: 51.01, left: 35.31 },
    { top: 56.51, left: 52.60 },
    { top: 88.04, left: 0.16 },
    { top: 47.20, left: 0.16 }, // Zurück zum Start
  ];

  // SVG-Pfad wird direkt im JSX generiert

  return (
    <div ref={containerRef} className="auth-container">
      {/* ClipPath für Glitzer-Bereich */}
      <svg 
        className="red-line-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }}
      >
        <defs>
          <clipPath id="glitter-clip-path" clipPathUnits="objectBoundingBox">
            <path d={redLinePoints.map((point, index) => {
              const x = point.left / 100;
              const y = point.top / 100;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') + ' Z'} />
          </clipPath>
        </defs>
      </svg>
      <SeaGlitter clipPathId="glitter-clip-path" points={redLinePoints} />
      <img 
        src="/Startseite_Wolke1.webp" 
        alt="Wolke" 
        className="cloud-image"
      />
      <img 
        src="/Startseite_Wolke2.webp" 
        alt="Wolke 2" 
        className="cloud-image-2"
      />
      <img 
        src="/Startseite_Wolke3.webp" 
        alt="Wolke 3" 
        className="cloud-image-3"
      />
      <img 
        src="/Startseite_Wolke4.webp" 
        alt="Wolke 4" 
        className="cloud-image-4"
      />
      <img 
        src="/Wolke5.webp" 
        alt="Wolke 5" 
        className="cloud-image-5"
      />
      <img 
        ref={affeImageRef}
        src="/Affe.webp" 
        alt="Affe" 
        className="affee-image"
      />
      {/* Prozent-Raster Button */}
      <div className="grid-controls">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="grid-toggle-button"
          title="Prozent-Raster ein/aus"
        >
          {showGrid ? 'Raster aus' : 'Raster an'}
        </button>
      </div>
      {/* Maus-Position-Anzeige - nur wenn Raster aktiviert ist */}
      {showGrid && mousePosition && (
        <div 
          className="mouse-position-display"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
          }}
        >
          <div className="position-info">
            <span className="position-label">Top:</span>
            <span className="position-value">{mousePosition.y.toFixed(2)}%</span>
          </div>
          <div className="position-info">
            <span className="position-label">Left:</span>
            <span className="position-value">{mousePosition.x.toFixed(2)}%</span>
          </div>
          <div className="position-hint">Leertaste zum Kopieren</div>
        </div>
      )}
      {/* Prozent-Raster */}
      {showGrid && (
        <div className="percent-grid">
          {/* Horizontale Linien (0-100%) */}
          {Array.from({ length: 11 }).map((_, i) => {
            const percent = i * 10;
            return (
              <div
                key={`h-${i}`}
                className="grid-line grid-line-horizontal"
                style={{ top: `${percent}%` }}
              >
                <span className="grid-label">{percent}%</span>
              </div>
            );
          })}
          {/* Vertikale Linien (0-100%) */}
          {Array.from({ length: 11 }).map((_, i) => {
            const percent = i * 10;
            return (
              <div
                key={`v-${i}`}
                className="grid-line grid-line-vertical"
                style={{ left: `${percent}%` }}
              >
                <span className="grid-label">{percent}%</span>
              </div>
            );
          })}
        </div>
      )}
      <div className="auth-card">
        <h1>Salz&Sand</h1>
        <h2>Anmelden</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {loadingServers ? (
            <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
              Lade Server...
            </div>
          ) : servers.length > 0 ? (
            <select
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              required
              style={{
                padding: '12px',
                border: '2px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '8px',
                fontSize: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#333',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              {servers.map((server) => (
                <option key={server.id} value={server.id}>
                  {server.name}
                  {server.settings?.gameSpeed && server.settings.gameSpeed !== 1
                    ? ` (${server.settings.gameSpeed}x Speed)`
                    : ''}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px', color: '#c33' }}>
              Keine Server verfügbar
            </div>
          )}
          <button type="submit" disabled={loading || !serverId}>
            {loading ? 'Lädt...' : 'Anmelden'}
          </button>
        </form>
        <p>
          Noch kein Account? <a href="/register">Registrieren</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
