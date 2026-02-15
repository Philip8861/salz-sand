import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './Admin.css';

interface Server {
  id: string;
  name: string;
  description?: string;
  status: 'inactive' | 'active' | 'maintenance';
  startTime: string | null;
  settings: {
    gameSpeed?: number;
  };
  createdAt: string;
  updatedAt?: string;
}

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'inactive' as 'inactive' | 'active' | 'maintenance',
    startDate: '',
    startTime: '',
    gameSpeed: 1,
  });

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    loadServers();
  }, [user, navigate]);

  const loadServers = async () => {
    try {
      const res = await api.get('/servers/admin/all');
      setServers(res.data.servers);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler beim Laden der Server');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Kombiniere Datum und Zeit zu ISO-String
      let startTime: string | null = null;
      if (formData.startDate && formData.startTime) {
        const dateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        if (isNaN(dateTime.getTime())) {
          setError('Ungültiges Datum oder Zeit');
          return;
        }
        startTime = dateTime.toISOString();
      }

      const serverData = {
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        startTime: startTime,
        settings: {
          gameSpeed: formData.gameSpeed,
        },
      };

      if (editingServer) {
        await api.put(`/servers/${editingServer.id}`, serverData);
        setSuccess('Server erfolgreich aktualisiert');
      } else {
        await api.post('/servers', serverData);
        setSuccess('Server erfolgreich erstellt');
      }

      setShowForm(false);
      setEditingServer(null);
      resetForm();
      loadServers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler beim Speichern');
    }
  };

  const handleEdit = (server: Server) => {
    setEditingServer(server);
    const startTime = server.startTime ? new Date(server.startTime) : null;
    setFormData({
      name: server.name,
      description: server.description || '',
      status: server.status,
      startDate: startTime ? startTime.toISOString().split('T')[0] : '',
      startTime: startTime ? startTime.toTimeString().slice(0, 8) : '',
      gameSpeed: server.settings?.gameSpeed || 1,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchtest du diesen Server wirklich löschen?')) {
      return;
    }

    try {
      await api.delete(`/servers/${id}`);
      setSuccess('Server erfolgreich gelöscht');
      loadServers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler beim Löschen');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'inactive',
      startDate: '',
      startTime: '',
      gameSpeed: 1,
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Nicht gesetzt';
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const isServerAvailable = (server: Server) => {
    if (server.status !== 'active') return false;
    if (!server.startTime) return true;
    return new Date(server.startTime) <= new Date();
  };

  if (loading) {
    return <div className="admin-loading">Lade Admin-Panel...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin-Panel</h1>
        <div className="admin-actions">
          <button onClick={() => navigate('/')}>Zurück zum Spiel</button>
          <button onClick={logout}>Abmelden</button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="admin-content">
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Server-Verwaltung</h2>
            <button onClick={() => { setShowForm(true); resetForm(); setEditingServer(null); }}>
              + Neuer Server
            </button>
          </div>

          {showForm && (
            <div className="admin-form">
              <h3>{editingServer ? 'Server bearbeiten' : 'Neuen Server erstellen'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Server-Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>Beschreibung</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    maxLength={500}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    required
                  >
                    <option value="inactive">Inaktiv</option>
                    <option value="active">Aktiv</option>
                    <option value="maintenance">Wartung</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start-Datum</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Start-Uhrzeit (HH:MM:SS)</label>
                  <input
                    type="time"
                    step="1"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                  <small>Format: HH:MM:SS (z.B. 14:30:00)</small>
                </div>

                <div className="form-group">
                  <label>Spielgeschwindigkeit</label>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={formData.gameSpeed}
                    onChange={(e) => setFormData({ ...formData, gameSpeed: parseFloat(e.target.value) || 1 })}
                  />
                  <small>Multiplikator für Ressourcen-Gewinn (Standard: 1.0)</small>
                </div>

                <div className="form-actions">
                  <button type="submit">{editingServer ? 'Aktualisieren' : 'Erstellen'}</button>
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); setEditingServer(null); }}>
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="servers-list">
            {servers.length === 0 ? (
              <p className="no-servers">Keine Server vorhanden</p>
            ) : (
              <table className="servers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Startzeit</th>
                    <th>Verfügbar</th>
                    <th>Spielgeschwindigkeit</th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {servers.map((server) => (
                    <tr key={server.id}>
                      <td>{server.name}</td>
                      <td>
                        <span className={`status-badge status-${server.status}`}>
                          {server.status === 'active' ? 'Aktiv' : 
                           server.status === 'maintenance' ? 'Wartung' : 'Inaktiv'}
                        </span>
                      </td>
                      <td>{formatDateTime(server.startTime)}</td>
                      <td>
                        {isServerAvailable(server) ? (
                          <span className="available-badge">✓ Verfügbar</span>
                        ) : (
                          <span className="unavailable-badge">✗ Nicht verfügbar</span>
                        )}
                      </td>
                      <td>{server.settings?.gameSpeed || 1}x</td>
                      <td>
                        <button onClick={() => handleEdit(server)} className="btn-edit">
                          Bearbeiten
                        </button>
                        <button onClick={() => handleDelete(server.id)} className="btn-delete">
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
