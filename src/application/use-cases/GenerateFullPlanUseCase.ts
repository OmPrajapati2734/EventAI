import type { IEventPlanRepository } from '../../domain/repositories/IEventPlanRepository.js';
import type { IEventPlannerService, PlanGenerationRequest } from '../../domain/services/IEventPlannerService.js';
import type { EventPlanResponseDTO } from '../dtos/eventPlan.dto.js';
import { z } from 'zod';
import {
  safeText,
  EventTypeSchema,
  CurrencySchema,
} from '../../domain/schemas/eventPlan.schema.js';

export const GenerateFullPlanRequestSchema = z
  .object({
    title: safeText(2, 120),
    eventType: EventTypeSchema,
    date: z.string().datetime({ message: 'Event date must be an ISO 8601 string.' }),
    guestCount: z.number().int().positive().max(50000),
    budgetLimit: z.number().min(0).max(100_000_000),
    currency: CurrencySchema,
    userPreferences: safeText(0, 500).optional(),
    culturalContext: safeText(0, 300).optional(),
  })
  .strict();

export type GenerateFullPlanRequest = z.infer<typeof GenerateFullPlanRequestSchema>;

/**
 * Use case orchestrating comprehensive GenAI event plan generation.
 */
export class GenerateFullPlanUseCase {
  constructor(
    private readonly repository: IEventPlanRepository,
    private readonly plannerService: IEventPlannerService
  ) {}

  public async execute(
    dto: GenerateFullPlanRequest,
    options?: { skipCache?: boolean; timeoutMs?: number }
  ): Promise<EventPlanResponseDTO> {
    const validated = GenerateFullPlanRequestSchema.parse(dto);

    const request: PlanGenerationRequest = {
      title: validated.title,
      eventType: validated.eventType,
      date: new Date(validated.date),
      guestCount: validated.guestCount,
      budgetLimit: validated.budgetLimit,
      currency: validated.currency,
      userPreferences: validated.userPreferences,
      culturalContext: validated.culturalContext,
    };

    // Generate complete aggregate root using Gemini AI Service
    const plan = await this.plannerService.generatePlan(request, options);

    // Save aggregate root to repository
    await this.repository.save(plan);

    return plan.toJSON();
  }
}
