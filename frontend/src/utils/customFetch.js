// Salva uma referência persistente (singleton) ao fetch nativo original para evitar recursividade infinita no HMR/re-render
if (!window.__originalFetch) {
  window.__originalFetch = window.fetch;
}

// Sobrescreve chamadas de fetch locais para injetar cabeçalho JWT e tratar 401
export const customFetch = async (url, options = {}) => {
  const token = localStorage.getItem('fo_token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const opt = { ...options, headers };
  
  try {
    const response = await window.__originalFetch(url, opt);
    if (response.status === 401) {
      localStorage.removeItem('fo_token');
      if (!window.__redirectingToLogin) {
        window.__redirectingToLogin = true;
        window.location.replace('/login.html');
      }
      return new Promise(() => {}); // Retorna uma promessa pendente para interromper fluxo
    }
    return response;
  } catch (e) {
    throw e;
  }
};

window.fetch = customFetch;
