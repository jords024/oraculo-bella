import { useState, useEffect } from 'react';
import { customFetch } from '../utils/customFetch';

export function useAppAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [branding, setBranding] = useState(() => {
    try {
      const cached = localStorage.getItem('fo_branding');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return {
      companyName: 'Tete',
      logoText: '@HAUCACAU',
      logoSub: 'PRODUÇÃO',
      logoSize: '6px',
      logoColor: '#ffffff',
      carouselTextSize: '15px',
      carouselTextColor: '#e4e4e7',
      titleTextSize: '18px',
      bodyTextSize: '12px',
      titleTextColor: '#ffffff',
      bodyTextColor: '#df0c7c',
      logoPosition: 'right'
    };
  });

  const loadCurrentUser = async () => {
    try {
      const res = await customFetch('/api/me');
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data);
        return data;
      } else {
        localStorage.removeItem('fo_token');
        if (!window.__redirectingToLogin) {
          window.__redirectingToLogin = true;
          window.location.replace('/login.html');
        }
      }
    } catch (e) {
      localStorage.removeItem('fo_token');
      if (!window.__redirectingToLogin) {
        window.__redirectingToLogin = true;
        window.location.replace('/login.html');
      }
    }
    return null;
  };

  const loadBranding = async () => {
    try {
      const res = await customFetch('/api/settings/branding');
      const data = await res.json();
      if (data) {
        setBranding(data);
        localStorage.setItem('fo_branding', JSON.stringify(data));
      }
    } catch (e) {}
  };

  useEffect(() => {
    const handleShowLogout = () => setLogoutModalOpen(true);
    window.addEventListener('show-logout-modal', handleShowLogout);
    return () => {
      window.removeEventListener('show-logout-modal', handleShowLogout);
    };
  }, []);

  return {
    currentUser,
    setCurrentUser,
    branding,
    setBranding,
    logoutModalOpen,
    setLogoutModalOpen,
    loadCurrentUser,
    loadBranding
  };
}
