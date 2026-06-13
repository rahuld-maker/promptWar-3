const DEFAULT_ERROR_MESSAGE = 'The AI Coach failed to generate tips. Please try again later.';

/**
 * Maps Gemini-related failures to stable HTTP responses.
 *
 * @param {Error} error
 * @returns {{ status: number, code: string, message: string, retryable: boolean }}
 */
export function classifyGeminiError(error) {
  const message = error?.message || '';

  if (message.includes('GEMINI_API_KEY')) {
    return {
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
      message: 'The AI Coach service is not configured. Please add GEMINI_API_KEY to backend .env.',
      retryable: false,
    };
  }

  if (message.includes('429') || message.includes('quota') || message.includes('Too Many Requests')) {
    return {
      status: 429,
      code: 'QUOTA_EXCEEDED',
      message: 'Gemini API free-tier quota exceeded for today. The AI Coach will be available again tomorrow, or upgrade your API plan at aistudio.google.com.',
      retryable: true,
    };
  }

  if (message.includes('404') || message.includes('not found')) {
    return {
      status: 503,
      code: 'MODEL_UNAVAILABLE',
      message: 'The AI model is temporarily unavailable. Please try again in a few minutes.',
      retryable: true,
    };
  }

  return {
    status: 500,
    code: 'INTERNAL_ERROR',
    message: DEFAULT_ERROR_MESSAGE,
    retryable: true,
  };
}
