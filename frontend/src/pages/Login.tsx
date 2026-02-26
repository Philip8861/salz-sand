import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import AuthBackground from '../components/AuthBackground';
import './Auth.css';

interface Server {
  id: string;
  name: string;
  description?: string;
  status?: string;
  settings?: any;
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverId, setServerId] = useState('');
  const [servers, setServers] = useState<Server[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLoadingServers] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [showFormFields, setShowFormFields] = useState(false);
  const [showImpressumModal, setShowImpressumModal] = useState(false);
  const [showImpressumSiegel, setShowImpressumSiegel] = useState(false);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [usernameFieldBox, setUsernameFieldBox] = useState({ top: 21.15, left: 43.6, width: 309, height: 41 });
  const [passwordFieldBox, setPasswordFieldBox] = useState({ top: 34.5, left: 43.6, width: 309, height: 41 });
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const setPressed = (pressed: boolean) => {
    submitButtonRef.current?.classList.toggle('auth-card-button-submit-pressed', pressed);
  };
  const { login } = useAuth();
  const hintergrundOverlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelBenutzernameRef = useRef<HTMLSpanElement>(null);
  const labelPasswortRef = useRef<HTMLSpanElement>(null);
  const inputUsernameRef = useRef<HTMLInputElement>(null);
  const inputPasswordRef = useRef<HTMLInputElement>(null);
  const forgotPasswordRef = useRef<HTMLAnchorElement>(null);
  const registerLinkRef = useRef<HTMLParagraphElement>(null);
  const topLinksRef = useRef<HTMLElement>(null);

  /* Formular erst nach Login_Bambus-Effekt (1,4 s) einblenden */
  useEffect(() => {
    const t = setTimeout(() => setShowFormFields(true), 1400);
    return () => clearTimeout(t);
  }, []);

  /* Scroll auf der Login-Seite deaktivieren – html + body fix */
  useEffect(() => {
    document.documentElement.classList.add('auth-page-active');
    document.body.classList.add('auth-page-active');
    return () => {
      document.documentElement.classList.remove('auth-page-active');
      document.body.classList.remove('auth-page-active');
    };
  }, []);

  /* Impressum-Modal mit Escape schließen */
  useEffect(() => {
    if (!showImpressumModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowImpressumModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showImpressumModal]);

  /* Siegel nach Wackel-Effekt (1 s) einblenden mit Klatsch-Animation */
  useEffect(() => {
    if (!showImpressumModal) {
      setShowImpressumSiegel(false);
      return;
    }
    const t = setTimeout(() => setShowImpressumSiegel(true), 1000);
    return () => clearTimeout(t);
  }, [showImpressumModal]);

  const loadServers = async (): Promise<Server[]> => {
    setLoadingServers(true);
    setError('');
    try {
      const res = await api.get('/servers');
      const activeServers = res.data.servers.filter((s: Server) => s.status === 'active');
      setServers(activeServers);
      if (activeServers.length > 0) {
        setServerId(activeServers[0].id);
      }
      return activeServers;
    } catch (err) {
      console.error('Fehler beim Laden der Server:', err);
      return [];
    } finally {
      setLoadingServers(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  // Design-Referenz (2560×1440) – Cover-Berechnung für Formular-Positionen (Hintergrund: AuthBackground)
  const DESIGN_WIDTH = 2560;
  const DESIGN_HEIGHT = 1440;

  // Formular – wie Affe am Hintergrund verankert (Cover-Berechnung), Design 2560×1440
  const FORM_UP = 3;
  const FORM_LABEL_BENUTZERNAME_TOP = 21.24 - FORM_UP + 4; /* + 0,5 % nach unten (war 3,5) */
  const FORM_LABEL_PASSWORT_TOP = 34.9 - FORM_UP + 1.3; /* Passwort 0,2 % nach oben (war +1,5) */
  const FORM_FORGOT_TOP = 42.87 - FORM_UP + 0.2; /* Passwort vergessen 0,2 % nach unten (war 0) */
  const FORM_BUTTON_TOP = 52.37 - FORM_UP - 1.5;
  const FORM_REGISTER_TOP = 59.87 - FORM_UP - 3; /* Noch kein Inselbesitzer 1 % nach oben (war -2) */
  const FORM_LABEL_BENUTZERNAME_FONT_PX = 43;
  const FORM_LABEL_PASSWORT_FONT_PX = 37;
  const FORM_INPUT_WIDTH_PX = 371;
  const FORM_INPUT_HEIGHT_PX = 49;
  const FORM_INPUT_USERNAME_FONT_PX = 31;
  const FORM_INPUT_PASSWORD_FONT_PX = 31; /* wie Benutzername, damit Textcursor (Caret) gleich groß ist */
  const FORM_BUTTON_MIN_WIDTH_PX = 240;
  const FORM_BUTTON_MIN_HEIGHT_PX = 53;
  const FORM_BUTTON_IMG_W_PX = 343;
  const FORM_BUTTON_IMG_H_PX = 74;
  const FORM_BUTTON_TEXT_FONT_PX = 34;
  const FORM_FORGOT_FONT_PX = 24;
  const FORM_REGISTER_FONT_PX = 23;   /* 10 % kleiner (26 * 0.9) */
  const FORM_REGISTER_INTRO_FONT_PX = 26;   /* 10 % kleiner (29 * 0.9) */
  const FORM_REGISTER_HIGHLIGHT_FONT_PX = 31; /* 10 % kleiner (34 * 0.9) */
  const FORM_TOP_LINKS_FONT_PX = 29; /* nochmal 10 % größer (26 * 1.1) – Forum, Impressum, AGB, … */

  /* Formular-Positionen – Cover-Berechnung (Hintergrund: AuthBackground) */
  useEffect(() => {
    const updatePositions = () => {
      if (!hintergrundOverlayRef.current) return;
      const rect = hintergrundOverlayRef.current.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const scale = Math.max(W / DESIGN_WIDTH, H / DESIGN_HEIGHT);
      const scaledWidth = DESIGN_WIDTH * scale;
      const scaledHeight = DESIGN_HEIGHT * scale;
      const cropX = Math.max(0, (scaledWidth - W) / 2);
      const cropY = Math.max(0, (scaledHeight - H) / 2);

      // Formular – wie Affe am Hintergrund verankert (Cover-Berechnung)
      const toViewport = (leftPct: number, topPct: number) => {
        const ax = DESIGN_WIDTH * (leftPct / 100);
        const ay = DESIGN_HEIGHT * (topPct / 100);
        const vx = rect.left + (ax * scale - cropX);
        const vy = rect.top + (ay * scale - cropY);
        return { x: vx, y: vy };
      };
      const setPx = (el: HTMLElement | null, styles: Record<string, string>) => { if (el) Object.assign(el.style, styles); };
      const px = (v: number) => `${v}px`;

      const vBenutzername = toViewport(50, FORM_LABEL_BENUTZERNAME_TOP);
      setPx(labelBenutzernameRef.current, { top: px(vBenutzername.y), left: px(vBenutzername.x), transform: 'translate(-50%, -50%)', fontSize: px(FORM_LABEL_BENUTZERNAME_FONT_PX * scale) });
      const vPasswort = toViewport(50, FORM_LABEL_PASSWORT_TOP);
      setPx(labelPasswortRef.current, { top: px(vPasswort.y), left: px(vPasswort.x), transform: 'translate(-50%, -50%)', fontSize: px(FORM_LABEL_PASSWORT_FONT_PX * scale) });

      const inputW = FORM_INPUT_WIDTH_PX * scale;
      const inputH = FORM_INPUT_HEIGHT_PX * scale;
      const vInputUser = toViewport(usernameFieldBox.left, usernameFieldBox.top + 3.4); /* Benutzerfeld: nochmal 0,1 % nach oben (war +3,5) */
      setPx(inputUsernameRef.current, { top: px(vInputUser.y), left: px(vInputUser.x), width: px(inputW), maxWidth: px(inputW), height: px(inputH), fontSize: px(FORM_INPUT_USERNAME_FONT_PX * scale), transform: 'none' });
      const vInputPass = toViewport(passwordFieldBox.left, passwordFieldBox.top + 1); /* Passwort-Eingabefeld 0,3 % nach oben (war +1,3) */
      setPx(inputPasswordRef.current, { top: px(vInputPass.y), left: px(vInputPass.x), width: px(inputW), maxWidth: px(inputW), height: px(inputH), fontSize: px(FORM_INPUT_PASSWORD_FONT_PX * scale), transform: 'none' });

      const vButton = toViewport(50, FORM_BUTTON_TOP);
      setPx(submitButtonRef.current, { top: px(vButton.y), left: px(vButton.x), transform: 'translate(-50%, -50%)', minWidth: px(FORM_BUTTON_MIN_WIDTH_PX * scale), minHeight: px(FORM_BUTTON_MIN_HEIGHT_PX * scale) });
      const btnImg = submitButtonRef.current?.querySelector('.auth-card-button-submit-img') as HTMLElement | null;
      if (btnImg) { btnImg.style.maxWidth = px(FORM_BUTTON_IMG_W_PX * scale); btnImg.style.maxHeight = px(FORM_BUTTON_IMG_H_PX * scale); }
      const btnText = submitButtonRef.current?.querySelector('.auth-card-button-submit-text') as HTMLElement | null;
      if (btnText) btnText.style.setProperty('font-size', px(FORM_BUTTON_TEXT_FONT_PX * scale), 'important');

      const vForgot = toViewport(50, FORM_FORGOT_TOP);
      setPx(forgotPasswordRef.current, { top: px(vForgot.y), left: px(vForgot.x), transform: 'translate(-50%, -50%)', fontSize: px(FORM_FORGOT_FONT_PX * scale) });
      const vRegister = toViewport(50, FORM_REGISTER_TOP);
      setPx(registerLinkRef.current, { top: px(vRegister.y), left: px(vRegister.x), transform: 'translate(-50%, -50%)', fontSize: px(FORM_REGISTER_FONT_PX * scale) });
      const registerIntro = registerLinkRef.current?.querySelector('.auth-card-register-intro') as HTMLElement | null;
      const registerHighlight = registerLinkRef.current?.querySelector('.auth-card-register-highlight') as HTMLElement | null;
      if (registerIntro) registerIntro.style.setProperty('font-size', px(FORM_REGISTER_INTRO_FONT_PX * scale), 'important');
      if (registerHighlight) registerHighlight.style.setProperty('font-size', px(FORM_REGISTER_HIGHLIGHT_FONT_PX * scale), 'important');

      setPx(topLinksRef.current, { fontSize: px(FORM_TOP_LINKS_FONT_PX * scale) });
    };

    updatePositions();
    const t1 = setTimeout(updatePositions, 150);
    const t2 = setTimeout(updatePositions, 400);
    const t3 = setTimeout(updatePositions, 800);
    let lastW = 0;
    let lastH = 0;
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const r = hintergrundOverlayRef.current?.getBoundingClientRect();
        const w = r?.width ?? 0;
        const h = r?.height ?? 0;
        if (Math.abs(w - lastW) > 1 || Math.abs(h - lastH) > 1) {
          updatePositions();
          lastW = w;
          lastH = h;
        }
      }, 100);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') updatePositions();
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(resizeTimeout);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [usernameFieldBox, passwordFieldBox]);

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
    if (loading) return;
    setError('');
    setLoading(true);

    let idToUse = serverId || (servers.length > 0 ? servers[0].id : '');
    if (!idToUse) {
      const loaded = await loadServers();
      idToUse = loaded.length > 0 ? loaded[0].id : '';
    }

    try {
      const res = await api.post('/auth/login', { username, password, serverId: idToUse });
      login(res.data.token, res.data.user, res.data.server);
      navigate('/');
    } catch (err: any) {
      let msg = 'Fehler beim Login';
      if (err.response?.data?.error) msg = err.response.data.error;
      else if (!err.response) msg = 'Verbindung zum Server fehlgeschlagen. Bitte starten Sie das Backend (im Ordner backend: npm run dev, Port 3000).';
      else if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="auth-container">
      {/* Links mittig am oberen Bildschirmrand, nebeneinander */}
      <nav ref={topLinksRef} className="auth-top-links" aria-label="Rechtliches und Einstellungen">
        <a href="/forum" className="auth-top-links-forum">Forum</a>
        <span className="auth-top-links-sep">·</span>
        <button type="button" className="auth-top-links-btn" onClick={() => setShowImpressumModal(true)}>Impressum</button>
        <span className="auth-top-links-sep">·</span>
        <button type="button" className="auth-top-links-btn" onClick={() => setShowImpressumModal(true)}>AGB</button>
        <span className="auth-top-links-sep">·</span>
        <button type="button" className="auth-top-links-btn" onClick={() => setShowImpressumModal(true)}>Datenschutzerklärung</button>
        <span className="auth-top-links-sep">·</span>
        <a href="/cookie-einstellung">Chockie Einstellung</a>
        <span className="auth-top-links-sep">·</span>
        <button type="button" className="auth-top-links-btn" onClick={() => setShowImpressumModal(true)}>Regeln</button>
      </nav>
      {/* Modal: Impressum.webp mit Glow, dunkler Hintergrund */}
      {showImpressumModal && (
        <div
          className="auth-impressum-overlay"
          onClick={() => setShowImpressumModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Impressum"
        >
          <div className="auth-impressum-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="auth-impressum-close" onClick={() => setShowImpressumModal(false)} aria-label="Schließen">
              <svg className="auth-impressum-close-icon" viewBox="0 0 32 32" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
                <ellipse cx="16" cy="13" rx="7" ry="8" fill="none" />
                <circle cx="12" cy="11.5" r="1.2" />
                <circle cx="20" cy="11.5" r="1.2" />
                <path d="M11 17 q5 3 10 0" fill="none" strokeWidth="1.2" />
                <line x1="6" y1="6" x2="26" y2="26" strokeWidth="2" />
                <line x1="26" y1="6" x2="6" y2="26" strokeWidth="2" />
              </svg>
            </button>
            <div className="auth-impressum-image-wrap">
              <img src="/Impressum.webp" alt="" className="auth-impressum-image-glow" aria-hidden="true" />
              <img src="/Impressum.webp" alt="" className="auth-impressum-image" />
              {showImpressumSiegel && (
                <img src="/Siegel.webp" alt="" className="auth-impressum-siegel" aria-hidden="true" />
              )}
              <div className="auth-impressum-content">
                <div className="auth-impressum-content-inner">
                  <h1 className="auth-impressum-title">Impressum</h1>
                  <div className="auth-impressum-text">
                    <p><strong>Inselpiraten GmbH & Co. KG</strong><br />
                    Hauptstrand 7 · 12345 Palmenhausen</p>
                    <p>Kapitän: Käpt'n Salzbart<br />
                    Steuermann: Sandrine Sandstrand</p>
                    <p>Handelsregister: Amtsgericht Schatzinsel, HRB 0815<br />
                    Umsatzsteuer-ID: DE 123 456 789 (falls wir mal was umsetzen)</p>
                    <p>Verantwortlich für Inhalte: Der Papagei (redaktionell geprüft)<br />
                    Kontakt: flaschenpost@salzundsand.de</p>
                    <p><em>Keine echten Piraten wurden bei der Erstellung dieses Impressums verletzt. Alle Inseln frei erfunden. Bei Sturm bitte Seekrankentabletten mitbringen.</em></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <AuthBackground ref={hintergrundOverlayRef} />
      {/* Prozent-Raster + Benutzername-Feld anpassen */}
      <div className="grid-controls">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="grid-toggle-button"
          title="Prozent-Raster ein/aus"
        >
          {showGrid ? 'Raster aus' : 'Raster an'}
        </button>
        <button
          type="button"
          onClick={() => setShowFieldEditor(!showFieldEditor)}
          className="grid-toggle-button"
          title="Benutzername-Kasten platzieren und vergrößern"
        >
          {showFieldEditor ? 'Feld-Editor schließen' : 'Feld anpassen'}
        </button>
      </div>
      {showFieldEditor && (
        <div className="field-editor-panel" aria-label="Eingabefelder Position und Größe">
          <div className="field-editor-title">Benutzername-Kasten</div>
          <label className="field-editor-row">
            <span>Top %</span>
            <input
              type="number"
              step={0.1}
              value={usernameFieldBox.top}
              onChange={(e) => setUsernameFieldBox((prev) => ({ ...prev, top: Number(e.target.value) || 0 }))}
            />
          </label>
          <label className="field-editor-row">
            <span>Left %</span>
            <input
              type="number"
              step={0.1}
              value={usernameFieldBox.left}
              onChange={(e) => setUsernameFieldBox((prev) => ({ ...prev, left: Number(e.target.value) || 0 }))}
            />
          </label>
          <label className="field-editor-row">
            <span>Breite</span>
            <input
              type="number"
              min={50}
              step={1}
              value={usernameFieldBox.width}
              onChange={(e) => {
                const w = Number(e.target.value) || 100;
                setUsernameFieldBox((prev) => ({ ...prev, width: w }));
                setPasswordFieldBox((prev) => ({ ...prev, width: w }));
              }}
            />
          </label>
          <label className="field-editor-row">
            <span>Höhe</span>
            <input
              type="number"
              min={10}
              step={1}
              value={usernameFieldBox.height}
              onChange={(e) => {
                const h = Number(e.target.value) || 20;
                setUsernameFieldBox((prev) => ({ ...prev, height: h }));
                setPasswordFieldBox((prev) => ({ ...prev, height: h }));
              }}
            />
          </label>
          <div className="field-editor-title field-editor-title-sep">Passwort-Kasten</div>
          <label className="field-editor-row">
            <span>Top %</span>
            <input
              type="number"
              step={0.1}
              value={passwordFieldBox.top}
              onChange={(e) => setPasswordFieldBox((prev) => ({ ...prev, top: Number(e.target.value) || 0 }))}
            />
          </label>
          <label className="field-editor-row">
            <span>Left %</span>
            <input
              type="number"
              step={0.1}
              value={passwordFieldBox.left}
              onChange={(e) => setPasswordFieldBox((prev) => ({ ...prev, left: Number(e.target.value) || 0 }))}
            />
          </label>
          <label className="field-editor-row">
            <span>Breite</span>
            <input
              type="number"
              min={50}
              step={1}
              value={passwordFieldBox.width}
              onChange={(e) => {
                const w = Number(e.target.value) || 100;
                setPasswordFieldBox((prev) => ({ ...prev, width: w }));
                setUsernameFieldBox((prev) => ({ ...prev, width: w }));
              }}
            />
          </label>
          <label className="field-editor-row">
            <span>Höhe</span>
            <input
              type="number"
              min={10}
              step={1}
              value={passwordFieldBox.height}
              onChange={(e) => {
                const h = Number(e.target.value) || 20;
                setPasswordFieldBox((prev) => ({ ...prev, height: h }));
                setUsernameFieldBox((prev) => ({ ...prev, height: h }));
              }}
            />
          </label>
        </div>
      )}
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
        <div className={`auth-card-fields ${showFormFields ? 'auth-card-fields-visible' : ''}`}>
          <span ref={labelBenutzernameRef} className="auth-label-benutzername" aria-hidden="true">Benutzername</span>
          <span ref={labelPasswortRef} className="auth-label-passwort" aria-hidden="true">Passwort</span>
          <input
            ref={inputUsernameRef}
            type="text"
            className="auth-card-input-username"
            placeholder=""
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-label="Benutzername"
          />
          {error && <div className="error">{error}</div>}
          <form id="login-form" onSubmit={handleSubmit}>
            <div className="auth-card-email-password">
              <input
                ref={inputPasswordRef}
                type="password"
                className="auth-card-input-password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              ref={submitButtonRef}
              type="submit"
              formNoValidate
              className="auth-card-button-submit auth-card-button-submit-image"
              aria-label="Anmelden"
              onMouseDown={() => setPressed(true)}
              onMouseUp={() => setPressed(false)}
              onMouseLeave={() => setPressed(false)}
              onTouchStart={() => setPressed(true)}
              onTouchEnd={() => setPressed(false)}
            >
              <span className="auth-card-button-submit-inner">
                <img src="/Button_Anmelden.webp" alt="" className="auth-card-button-submit-img" />
                <span className="auth-card-button-submit-text">Anmelden</span>
              </span>
            </button>
          </form>
          <a ref={forgotPasswordRef} href="/forgot-password" className="auth-card-forgot-password">Passwort vergessen</a>
          <p ref={registerLinkRef} className="auth-card-register-link">
            <a href="/register"><span className="auth-card-register-intro">Noch kein Inselbesitzer? Gleich kostenlos </span><span className="auth-card-register-highlight">Registrieren!</span></a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
