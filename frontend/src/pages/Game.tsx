import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './Game.css';

interface GameData {
  id: string;
  level: number;
  experience: number;
  coins: number;
  salt: number;
  sand: number;
  lastAction: string;
}

const Game = () => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const res = await api.get('/game/data');
      setGameData(res.data.gameData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType: string, data?: any) => {
    try {
      setError('');
      const res = await api.post('/game/action', { actionType, data });
      setGameData(res.data.gameData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler bei der Aktion');
    }
  };

  if (loading) {
    return <div className="loading">Lade Spiel...</div>;
  }

  if (!gameData) {
    return <div className="error">Spieldaten nicht gefunden</div>;
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Salz&Sand</h1>
        <div>
          {user?.isAdmin && (
            <button onClick={() => navigate('/admin')} style={{ marginRight: '10px' }}>
              Admin-Panel
            </button>
          )}
          <button onClick={() => { logout(); navigate('/login'); }}>
            Abmelden
          </button>
        </div>
      </header>

      <div className="game-content">
        <div className="stats-panel">
          <h2>Spieler-Statistiken</h2>
          <div className="stat">
            <span>Level:</span>
            <span className="value">{gameData.level}</span>
          </div>
          <div className="stat">
            <span>Erfahrung:</span>
            <span className="value">{gameData.experience}</span>
          </div>
          <div className="stat">
            <span>Münzen:</span>
            <span className="value">{gameData.coins} 🪙</span>
          </div>
          <div className="stat">
            <span>Salz:</span>
            <span className="value">{gameData.salt} 🧂</span>
          </div>
          <div className="stat">
            <span>Sand:</span>
            <span className="value">{gameData.sand} 🏖️</span>
          </div>
        </div>

        <div className="actions-panel">
          <h2>Aktionen</h2>
          {error && <div className="error-message">{error}</div>}
          
          <div className="action-buttons">
            <button
              className="action-btn salt"
              onClick={() => handleAction('collect_salt')}
            >
              🧂 Salz sammeln
            </button>
            <button
              className="action-btn sand"
              onClick={() => handleAction('collect_sand')}
            >
              🏖️ Sand sammeln
            </button>
            <button
              className="action-btn sell"
              onClick={() => handleAction('sell_resources', {
                salt: gameData.salt,
                sand: gameData.sand
              })}
              disabled={gameData.salt === 0 && gameData.sand === 0}
            >
              💰 Ressourcen verkaufen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
