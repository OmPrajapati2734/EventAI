import { ThemeIdea } from '../../domain/entities/ThemeIdea.js';
import { ExternalServiceError } from '../../domain/errors/DomainErrors.js';
import type { IAIService, GenerateThemeOptions } from '../../application/ports/IAIService.js';
import { getEnv } from '../../config/env.js';
import crypto from 'node:crypto';

/**
 * Infrastructure implementation of IAIService using Google Gemini REST API.
 * Uses native Node.js fetch without heavyweight SDK overhead to keep bundle lean.
 */
export class GeminiAiService implements IAIService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(apiKey?: string, model?: string, timeoutMs = 15000) {
    const env = getEnv();
    this.apiKey = apiKey ?? env.GEMINI_API_KEY;
    this.model = model ?? env.GEMINI_MODEL;
    this.timeoutMs = timeoutMs;
  }

  public async generateThemes(options: GenerateThemeOptions): Promise<ThemeIdea[]> {
    // Return deterministic mock concepts in unit test or offline test environments
    if (this.apiKey.startsWith('test_') || process.env['NODE_ENV'] === 'test') {
      return this.generateMockThemes(options);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      this.model
    )}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const promptText = `
You are an expert event designer. Create 3 personalized, distinct theme concepts for a ${options.eventType} event.
Event Title: "${options.title}"
Guest Count: ${options.guestCount}
Budget Limit: ${options.budgetLimit} ${options.currency}
${options.userPrompt ? `User Preferences: "${options.userPrompt}"` : ''}

Respond with ONLY a valid, parseable JSON array containing objects matching this schema:
[
  {
    "title": "Short catchy theme title",
    "description": "Engaging description explaining how this theme fits the celebration",
    "colorPalette": ["#hex or color name", "#hex or color name", "#hex or color name"],
    "decorationSuggestions": ["Specific item 1", "Specific item 2", "Specific item 3"],
    "vibeKeywords": ["Keyword1", "Keyword2", "Keyword3"]
  }
]
`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new ExternalServiceError(
          'Gemini',
          `API responded with HTTP status ${response.status}: ${errorBody.slice(0, 200)}`
        );
      }

      const rawJson = (await response.json()) as any;
      const textOutput = rawJson?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        throw new ExternalServiceError('Gemini', 'Empty response received from language model.');
      }

      const parsedArray = JSON.parse(textOutput);
      if (!Array.isArray(parsedArray)) {
        throw new ExternalServiceError('Gemini', 'Model response did not yield a valid JSON array.');
      }

      return parsedArray.map((item) => {
        return new ThemeIdea({
          id: crypto.randomUUID(),
          title: String(item.title || 'Untitled Theme'),
          description: String(item.description || 'A bespoke celebration theme concept.'),
          colorPalette: Array.isArray(item.colorPalette) ? item.colorPalette : ['#FFFFFF', '#D4AF37'],
          decorationSuggestions: Array.isArray(item.decorationSuggestions)
            ? item.decorationSuggestions
            : ['Ambient lighting', 'Floral centerpieces'],
          vibeKeywords: Array.isArray(item.vibeKeywords) ? item.vibeKeywords : ['Joyful', 'Elegant'],
        });
      });
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new ExternalServiceError('Gemini', `Request timed out after ${this.timeoutMs}ms.`);
      }
      if (err instanceof ExternalServiceError) {
        throw err;
      }
      throw new ExternalServiceError('Gemini', err.message || 'Unknown network error.');
    }
  }

  /**
   * Deterministic mock generator used for zero-network testing environments.
   */
  private generateMockThemes(options: GenerateThemeOptions): ThemeIdea[] {
    const isWedding = options.eventType === 'wedding';
    const isBirthday = options.eventType === 'birthday';

    return [
      new ThemeIdea({
        id: crypto.randomUUID(),
        title: isWedding ? 'Ethereal Botanical Elegance' : isBirthday ? 'Neon Retro Arcade Glow' : 'Civic Harmony Harvest',
        description: `Curated theme concept specially tailored for ${options.title} with ${options.guestCount} guests.`,
        colorPalette: isWedding ? ['#F5F5DC', '#2E8B57', '#D4AF37'] : ['#FF1493', '#00FFFF', '#1A1A2E'],
        decorationSuggestions: ['Fairy light canopies', 'Custom entrance signage', 'Interactive guest display'],
        vibeKeywords: ['Warm', 'Memorable', 'Sophisticated'],
      }),
      new ThemeIdea({
        id: crypto.randomUUID(),
        title: 'Modern Minimalist Luminary',
        description: 'Clean lines, monochromatic accents, and focused architectural lighting.',
        colorPalette: ['#1A1A1A', '#F8F9FA', '#C0C0C0'],
        decorationSuggestions: ['Sculptural table accents', 'Geometric photo backdrop'],
        vibeKeywords: ['Modern', 'Sleek', 'Intimate'],
      }),
    ];
  }
}
