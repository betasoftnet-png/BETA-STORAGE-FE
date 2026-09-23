/**
 * BNX Storage API Service
 * Integrates with BNX Mail backend storage quota API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Fetch storage quota for the authenticated user
 * Endpoint: GET /api/mail/storage-quota
 * 
 * @param {string} bnxAccessToken - The BNX Mail access token identifying the user
 * @returns {Promise<{email: string, storageUsed: number, storageLimit: number, storagePercentage: number}>}
 */
export async function getStorageQuota(bnxAccessToken) {
  if (!bnxAccessToken) {
    throw new Error('BNX Mail access token is required');
  }

  const cleanToken = bnxAccessToken.trim();
  const authHeader = cleanToken.startsWith('Bearer ') ? cleanToken : `Bearer ${cleanToken}`;

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': authHeader
  };

  const response = await fetch(`${API_BASE_URL}/api/mail/storage-quota`, {
    method: 'GET',
    headers,
    credentials: 'include'
  });

  if (!response.ok) {
    let errorDetail = `Failed to fetch storage quota (HTTP ${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errorDetail = errJson.message;
      }
    } catch (_) {}
    throw new Error(errorDetail);
  }

  const result = await response.json();
  if (result && result.data) {
    return result.data;
  }

  throw new Error(result?.message || 'Invalid API response format');
}
