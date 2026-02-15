import { useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
}

interface Server {
  id: string;
  name: string;
  settings?: any;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const serverData = localStorage.getItem('server');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          if (serverData) {
            setServer(JSON.parse(serverData));
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('server');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: User, serverData?: Server | null) => {
    localStorage.setItem('token', token);
    setUser(userData);
    if (serverData) {
      localStorage.setItem('server', JSON.stringify(serverData));
      setServer(serverData);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('server');
    setUser(null);
    setServer(null);
  };

  return { user, server, loading, login, logout };
};
