const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password })
  });
  const resJson = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(resJson?.message || `Authentication failed (HTTP ${response.status})`);
  }
  if (resJson?.data?.status === '2FA_REQUIRED' || resJson?.data?.tempToken) {
    return { is2FA: true, tempToken: resJson.data.tempToken, email: email.trim() };
  }
  const tokenData = resJson?.data || resJson;
  const accessToken = tokenData.accessToken || tokenData.token;
  const refreshToken = tokenData.refreshToken;
  if (!accessToken) {
    throw new Error(resJson?.message || 'Access token not provided in login response');
  }
  return { is2FA: false, accessToken, refreshToken, email: tokenData.email || tokenData.user?.email || email.trim() };
}

export async function verify2FA(tempToken, code) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login/2fa`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempToken, code: code.trim() })
  });
  const resJson = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(resJson?.message || `2FA verification failed (HTTP ${response.status})`);
  }
  const tokenData = resJson?.data || resJson;
  const accessToken = tokenData.accessToken || tokenData.token;
  const refreshToken = tokenData.refreshToken;
  if (!accessToken) {
    throw new Error(resJson?.message || 'Access token not provided in 2FA response');
  }
  return { accessToken, refreshToken, email: tokenData.email || tokenData.user?.email };
}

export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  const resJson = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(resJson?.message || `Token refresh failed (HTTP ${response.status})`);
  }
  const tokenData = resJson?.data || resJson;
  const accessToken = tokenData.accessToken || tokenData.token;
  const newRefreshToken = tokenData.refreshToken || refreshToken;
  if (!accessToken) {
    throw new Error(resJson?.message || 'New access token not provided in refresh response');
  }
  return { accessToken, refreshToken: newRefreshToken };
}