/**
 * BNX Storage API Service
 * Integrates with BNX Mail backend storage quota API
 */

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  return 'https://api.bnxmail.com';
};

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

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/mail/storage-quota`, {
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

  let result = null;
  try {
    const rawText = await response.text();
    if (rawText && !rawText.trim().startsWith('<')) {
      result = JSON.parse(rawText);
    }
  } catch (_) {
    result = null;
  }

  const data = result?.data || result;

  if (data && (data.storageUsed !== undefined || data.used !== undefined || data.usedBytes !== undefined || data.storage_used !== undefined || data.email)) {
    const normalized = {
      email: data.email || '',
      storageUsed: Number(data.storageUsed ?? data.used ?? data.usedBytes ?? data.storage_used ?? 0),
      storageLimit: Number(data.storageLimit ?? data.limit ?? data.limitBytes ?? data.storage_limit ?? 5368709120),
      storagePercentage: Number(data.storagePercentage ?? data.percentage ?? data.storage_percentage ?? data.usedPercentage ?? 0)
    };
    // console.log('[BNX Storage API] Successfully received storage quota:', normalized);
    return normalized;
  }

  if (result) {
    throw new Error(result?.message || 'Invalid API response format');
  }

  return null;
}
