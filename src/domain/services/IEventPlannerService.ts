import type { EventType } from '../entities/Event.js';
import type { EventPlan } from '../entities/EventPlan.js';
import type { ThemeIdea } from '../entities/ThemeIdea.js';

/**
 * Domain input parameters for generating a comprehensive celebration plan.
 */
export interface PlanGenerationRequest {
  title: string;
  eventType: EventType;
  date: Date | string;
  guestCount: number;
  budgetLimit: number;
  currency: string;
  userPreferences?: string;
  culturalContext?: string;
}

/**
 * Execution options for plan generation, supporting timeout cancellation and cache bypassing.
 */
export interface PlanGenerationOptions {
  signal?: AbortSignal;
  skipCache?: boolean;
  timeoutMs?: number;
}

/**
 * Domain-level service interface for GenAI-driven Event Planning.
 * Decouples enterprise business workflows from concrete LLM SDK implementations.
 */
export interface IEventPlannerService {
  /**
   * Generates a fully populated EventPlan aggregate root containing:
   * - Proportional, realistic budget allocations
   * - Chronologically sequenced day-of-event timeline milestones
   * - Vendor procurement checklist items
   * - Culturally and contextually personalized aesthetic theme concepts
   */
  generatePlan(
    request: PlanGenerationRequest,
    options?: PlanGenerationOptions
  ): Promise<EventPlan>;

  /**
   * Generates tailored creative theme ideas and aesthetic concepts only.
   */
  generateThemes(
    request: PlanGenerationRequest,
    options?: PlanGenerationOptions
  ): Promise<ThemeIdea[]>;
}
