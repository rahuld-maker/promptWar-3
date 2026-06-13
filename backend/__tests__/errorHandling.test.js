import { describe, expect, it } from 'vitest';
import { classifyGeminiError } from '../utils/errorHandling.js';

describe('classifyGeminiError', () => {
  it('maps missing API key failures to a service-unavailable response', () => {
    const result = classifyGeminiError(new Error('GEMINI_API_KEY is not configured in the backend environment variables.'));

    expect(result.status).toBe(503);
    expect(result.code).toBe('SERVICE_UNAVAILABLE');
    expect(result.message).toContain('GEMINI_API_KEY');
  });

  it('maps quota and rate-limit failures to a retryable response', () => {
    const result = classifyGeminiError(new Error('429 Too Many Requests from Gemini API.'));

    expect(result.status).toBe(429);
    expect(result.code).toBe('QUOTA_EXCEEDED');
    expect(result.retryable).toBe(true);
  });
});
