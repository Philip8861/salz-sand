import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SeaGlitter from '../components/SeaGlitter';
import './Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler bei der Registrierung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <SeaGlitter />
      <div className="auth-card">
        <h1>Salz&Sand</h1>
        <h2>Registrieren</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
          />
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Passwort (min. 8 Zeichen)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Lädt...' : 'Registrieren'}
          </button>
        </form>
        <p>
          Bereits ein Account? <a href="/login">Anmelden</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
