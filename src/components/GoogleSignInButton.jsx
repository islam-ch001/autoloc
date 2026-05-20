import { useEffect, useRef } from 'react';

// Charge dynamiquement le script GIS de Google
let gisLoading = null;
function loadGIS() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisLoading) return gisLoading;
  gisLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Impossible de charger Google Identity'));
    document.head.appendChild(s);
  });
  return gisLoading;
}

export default function GoogleSignInButton({ clientId, onCredential, onError, theme = 'filled_black', text = 'continue_with' }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!clientId) {
      onError?.('Google Client ID manquant (VITE_GOOGLE_CLIENT_ID)');
      return;
    }
    let cancelled = false;
    loadGIS()
      .then(() => {
        if (cancelled) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) onCredential(response.credential);
          },
          ux_mode: 'popup',
          auto_select: false,
        });
        if (wrapRef.current) {
          wrapRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(wrapRef.current, {
            theme,
            size: 'large',
            text,
            shape: 'rectangular',
            logo_alignment: 'left',
            width: wrapRef.current.offsetWidth || 320,
          });
        }
      })
      .catch(err => onError?.(err.message));
    return () => { cancelled = true; };
  }, [clientId, theme, text]);

  return <div ref={wrapRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />;
}
