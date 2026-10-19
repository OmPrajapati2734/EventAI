import type { IEventPlanRepository } from '../../domain/repositories/IEventPlanRepository.js';
import type { EventPlanResponseDTO } from '../dtos/eventPlan.dto.js';
import { EntityNotFoundError } from '../../domain/errors/DomainErrors.js';

export class GetEventPlanUseCase {
  constructor(private readonly repository: IEventPlanRepository) {}

  public async execute(id: string): Promise<EventPlanResponseDTO> {
    if (!id || typeof id !== 'string') {
      throw new EntityNotFoundError('EventPlan', id);
    }

    const plan = await this.repository.findById(id);
    if (!plan) {
      throw new EntityNotFoundError('EventPlan', id);
    }

    return plan.toJSON();
  }
}
