import type { EventType } from '../../domain/entities/Event.js';
import type { ThemeIdea } from '../../domain/entities/ThemeIdea.js';

export interface GenerateThemeOptions {
  eventType: EventType;
  title: string;
  guestCount: number;
  budgetLimit: number;
  currency: string;
  userPrompt?: string;
}

/**
 * Port representing the AI Generation capability (Gemini LLM).
 */
export interface IAIService {
  /**
   * Generates tailored celebration theme concepts and decorative aesthetic suggestions.
   */
  generateThemes(options: GenerateThemeOptions): Promise<ThemeIdea[]>;
}
