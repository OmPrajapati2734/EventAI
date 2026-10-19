import crypto from 'node:crypto';
import type { IEventPlanRepository } from '../../domain/repositories/IEventPlanRepository.js';
import { BudgetItem } from '../../domain/entities/BudgetItem.js';
import { EntityNotFoundError } from '../../domain/errors/DomainErrors.js';
import { AddBudgetItemRequestSchema } from '../../domain/schemas/eventPlan.schema.js';
import type { AddBudgetItemDTO, EventPlanResponseDTO } from '../dtos/eventPlan.dto.js';

export class AddBudgetItemUseCase {
  constructor(private readonly repository: IEventPlanRepository) {}

  public async execute(
    planId: string,
    dto: AddBudgetItemDTO,
    enforceBudgetLimit = false
  ): Promise<EventPlanResponseDTO> {
    const validated = AddBudgetItemRequestSchema.parse(dto);

    const plan = await this.repository.findById(planId);
    if (!plan) {
      throw new EntityNotFoundError('EventPlan', planId);
    }

    const newItem = new BudgetItem({
      id: crypto.randomUUID(),
      category: validated.category,
      allocatedAmount: validated.allocatedAmount,
      actualAmount: validated.actualAmount ?? 0,
      notes: validated.notes,
    });

    plan.addBudgetItem(newItem, enforceBudgetLimit);
    await this.repository.save(plan);

    return plan.toJSON();
  }
}
