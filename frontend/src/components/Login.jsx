import React, { useEffect, useState } from 'react';

// Login como rota client-side (sem hard navigation) — substitui o antigo public/login.html.
// Evita o full page reload que causava o "flicker" no título da aba ao trocar de tela.
export default function Login({ onSuccess }) {
  const [companyName, setCompanyName] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/settings/branding')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.companyName) {
          setCompanyName(data.companyName);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Credenciais inválidas. Tente novamente.' }));
        setError(errData.detail || 'Credenciais inválidas. Tente novamente.');
        setSubmitting(false);
        return;
      }

      const resJson = await response.json();
      if (resJson.token) {
        localStorage.setItem('fo_token', resJson.token);
        onSuccess(resJson.token);
      } else {
        setError('Erro ao obter token de acesso.');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor. Tente novamente mais tarde.');
      setSubmitting(false);
    }
  };

  const renderBrand = () => {
    if (!companyName) return <><em>Oculta</em></>;
    const words = companyName.trim().split(/\s+/);
    if (words.length > 1) {
      const lastWord = words.pop();
      const firstPart = words.join(' ');
      return <>{firstPart}<br /><em>{lastWord}</em></>;
    }
    return <em>{companyName}</em>;
  };

  return (
    <div className="login-screen">
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Space+Grotesk:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .login-screen, .login-screen *, .login-screen *::before, .login-screen *::after { box-sizing: border-box; }

        .login-screen {
          --gold:     #C9A84C;
          --gold-dim: rgba(201,168,76,0.12);
          --bg:       #080808;
          --text:     #EDE8DF;
          --text-dim: rgba(237,232,223,0.4);
          --border:   rgba(201,168,76,0.18);
          --serif:    'Cormorant Garamond', Georgia, serif;
          --sans:     'Space Grotesk', sans-serif;

          position: fixed;
          inset: 0;
          background: var(--bg);
          color: var(--text);
          font-family: var(--sans);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 100000;
        }

        .login-screen::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0; opacity: 0.4;
        }

        .login-screen .glow {
          position: fixed;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 65%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .login-screen .card {
          position: relative; z-index: 1;
          width: 100%;
          max-width: 400px;
          padding: 56px 48px;
          border: 1px solid var(--border);
          background: rgba(12,12,12,0.9);
          text-align: center;
          animation: loginFadeUp 0.7s ease-out forwards;
        }

        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-screen .eyebrow {
          font-size: 10px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--gold);
          font-family: var(--sans);
          margin-bottom: 20px;
          opacity: 0.8;
        }

        .login-screen .brand {
          font-family: var(--serif);
          font-size: 36px;
          font-weight: 300;
          color: var(--text);
          line-height: 1.1;
          margin-bottom: 8px;
        }

        .login-screen .brand em {
          font-style: italic;
          color: var(--gold);
        }

        .login-screen .divider {
          width: 32px; height: 1px;
          background: var(--gold);
          opacity: 0.4;
          margin: 24px auto;
        }

        .login-screen .subtitle {
          font-size: 12px;
          color: var(--text-dim);
          letter-spacing: 0.05em;
          margin-bottom: 36px;
          line-height: 1.6;
        }

        .login-screen .field {
          margin-bottom: 16px;
          text-align: left;
        }

        .login-screen .field label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          opacity: 0.7;
          margin-bottom: 8px;
        }

        .login-screen .field input {
          width: 100%;
          background: rgba(201,168,76,0.05);
          border: 1px solid var(--border);
          color: var(--text);
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 300;
          padding: 12px 16px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          letter-spacing: 0.03em;
        }

        .login-screen .field input:focus {
          border-color: rgba(201,168,76,0.5);
          background: rgba(201,168,76,0.08);
        }

        .login-screen .field input::placeholder {
          color: var(--text-dim);
          font-weight: 300;
        }

        .login-screen .field input[type="password"] {
          letter-spacing: 0.2em;
        }

        .login-screen .btn-login {
          width: 100%;
          margin-top: 8px;
          padding: 14px;
          background: transparent;
          border: 1px solid var(--gold);
          color: var(--gold);
          font-family: var(--sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
        }

        .login-screen .btn-login:hover {
          background: var(--gold);
          color: #080808;
        }

        .login-screen .btn-login:active {
          transform: scale(0.99);
        }

        .login-screen .btn-login:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .login-screen .error-msg {
          margin-top: 16px;
          font-size: 12px;
          color: #DC2626;
          letter-spacing: 0.05em;
        }

        .login-screen .footer-note {
          margin-top: 32px;
          font-size: 10px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
          opacity: 0.5;
        }

        @media (max-width: 480px) {
          .login-screen .card { padding: 40px 28px; margin: 16px; }
        }
      `}</style>

      <div className="glow"></div>

      <div className="card">
        <div className="eyebrow">Estúdio de Conteúdo</div>
        <div className="brand">Fonte<br />{renderBrand()}</div>
        <div className="divider"></div>
        <p className="subtitle">Acesso restrito ao estúdio.<br />Insira suas credenciais para continuar.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Usuário</label>
            <input
              type="text"
              name="username"
              placeholder="seu usuário"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Senha</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '44px', width: '100%' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, outline: 'none' }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-login" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {error && <div className="error-msg">{error}</div>}

        <div className="footer-note">Oraculo · Plataforma Interna</div>
      </div>
    </div>
  );
}
