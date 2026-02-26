import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [showAgbModal, setShowAgbModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  /* Scroll auf der Register-Seite deaktivieren – gleicher Fix wie Login */
  useEffect(() => {
    document.documentElement.classList.add('auth-page-active');
    document.body.classList.add('auth-page-active');
    return () => {
      document.documentElement.classList.remove('auth-page-active');
      document.body.classList.remove('auth-page-active');
    };
  }, []);

  useEffect(() => {
    if (!showAgbModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAgbModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAgbModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordRepeat) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    if (!agbAccepted) {
      setError('Bitte die AGB akzeptieren.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        username,
        email,
        password,
        passwordRepeat,
        agbAccepted,
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      let msg = 'Fehler bei der Registrierung';
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.response?.data?.details?.length) {
        const first = err.response.data.details[0];
        msg = typeof first === 'string' ? first : (first?.message || msg);
      } else if (!err.response) {
        msg = 'Verbindung zum Server fehlgeschlagen. Bitte starten Sie das Backend (im Ordner backend: npm run dev, Port 3000).';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-register-page">
      <nav className="auth-top-links" aria-label="Rechtliches und Einstellungen">
        <a href="/forum" className="auth-top-links-forum">Forum</a>
        <span className="auth-top-links-sep">·</span>
        <a href="/impressum" className="auth-top-links-btn">Impressum</a>
        <span className="auth-top-links-sep">·</span>
        <button type="button" className="auth-top-links-btn" onClick={() => setShowAgbModal(true)}>AGB</button>
        <span className="auth-top-links-sep">·</span>
        <a href="/datenschutz">Datenschutzerklärung</a>
        <span className="auth-top-links-sep">·</span>
        <a href="/cookie-einstellung">Chockie Einstellung</a>
        <span className="auth-top-links-sep">·</span>
        <button type="button" className="auth-top-links-btn" onClick={() => setShowAgbModal(true)}>Regeln</button>
      </nav>
      <div className="auth-card auth-card-register">
        <div className="auth-register-header">
          <h1 className="auth-register-logo">Salz und Sand</h1>
          <h2 className="auth-register-title">Anker lichten – Registrieren</h2>
        </div>
        {error && <div className="auth-register-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-register-form">
          <input
            type="text"
            className="auth-register-input"
            placeholder="Benutzername (3–20 Zeichen)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            autoComplete="username"
          />
          <input
            type="email"
            className="auth-register-input"
            placeholder="E-Mail (Flaschenpost-Adresse)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            className="auth-register-input"
            placeholder="Passwort (Groß-/Kleinbuchstaben, Zahl, Sonderzeichen)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <input
            type="password"
            className="auth-register-input"
            placeholder="Passwort wiederholen"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            required
            autoComplete="new-password"
          />
          <label className="auth-register-agb">
            <input
              type="checkbox"
              checked={agbAccepted}
              onChange={(e) => setAgbAccepted(e.target.checked)}
            />
            <span>
              Ich habe die{' '}
              <button
                type="button"
                className="auth-register-agb-link"
                onClick={(e) => { e.preventDefault(); setShowAgbModal(true); }}
              >
                AGB
              </button>
              {' '}gelesen und akzeptiert.
            </span>
          </label>
          <button type="submit" className="auth-register-submit" disabled={loading}>
            {loading ? 'Wird eingetragen...' : 'An Bord gehen'}
          </button>
        </form>
        <p className="auth-register-login-link">
          Bereits an Bord? <a href="/login">Anmelden</a>
        </p>
      </div>
      {showAgbModal && (
        <div
          className="auth-agb-overlay"
          onClick={() => setShowAgbModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="AGB"
        >
          <div className="auth-agb-modal auth-agb-modal-pirate" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="auth-agb-close auth-agb-close-pirate" onClick={() => setShowAgbModal(false)} aria-label="Schließen">
              ×
            </button>
            <h2 className="auth-agb-title auth-agb-title-pirate">AGB</h2>
            <div className="auth-agb-text auth-agb-text-pirate">
              <p>Allgemeine Geschäftsbedingungen von Salz und Sand. Hier können die AGB-Inhalte stehen.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
