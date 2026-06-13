/**
 * Small fetch wrapper for JSON APIs with consistent error normalization.
 *
 * @param {string} url - Request URL.
 * @param {RequestInit} [options] - Fetch options.
 * @returns {Promise<any>} Parsed JSON response.
 */
export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

/**
 * Converts an API failure into a user-friendly message.
 *
 * @param {unknown} error
 * @returns {string}
 */
export function getApiErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while contacting the server. Please try again.';
}
