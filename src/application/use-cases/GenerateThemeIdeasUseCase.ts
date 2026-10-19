import type { IEventPlanRepository } from '../../domain/repositories/IEventPlanRepository.js';
import type { IAIService } from '../ports/IAIService.js';
import type { GenerateThemeDTO, EventPlanResponseDTO } from '../dtos/eventPlan.dto.js';
import { EntityNotFoundError } from '../../domain/errors/DomainErrors.js';
import { GenerateThemeRequestSchema } from '../../domain/schemas/eventPlan.schema.js';

export class GenerateThemeIdeasUseCase {
  constructor(
    private readonly repository: IEventPlanRepository,
    private readonly aiService: IAIService
  ) {}

  public async execute(dto: GenerateThemeDTO): Promise<EventPlanResponseDTO> {
    const validated = GenerateThemeRequestSchema.parse(dto);

    const plan = await this.repository.findById(validated.eventPlanId);
    if (!plan) {
      throw new EntityNotFoundError('EventPlan', validated.eventPlanId);
    }

    const themes = await this.aiService.generateThemes({
      eventType: plan.event.eventType,
      title: plan.event.title,
      guestCount: plan.event.guestCount,
      budgetLimit: plan.event.budgetLimit,
      currency: plan.event.currency,
      userPrompt: validated.preferences,
    });

    plan.setThemeIdeas(themes);
    await this.repository.save(plan);

    return plan.toJSON();
  }
}
