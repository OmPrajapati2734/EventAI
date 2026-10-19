import type { Request, Response, NextFunction } from 'express';
import type { CreateEventPlanUseCase } from '../../application/use-cases/CreateEventPlanUseCase.js';
import type { GetEventPlanUseCase } from '../../application/use-cases/GetEventPlanUseCase.js';
import type { AddBudgetItemUseCase } from '../../application/use-cases/AddBudgetItemUseCase.js';
import type { GenerateThemeIdeasUseCase } from '../../application/use-cases/GenerateThemeIdeasUseCase.js';
import type { IEventPlanRepository } from '../../domain/repositories/IEventPlanRepository.js';
import type { EventType } from '../../domain/entities/Event.js';

import type { GenerateFullPlanUseCase } from '../../application/use-cases/GenerateFullPlanUseCase.js';

export class EventPlanController {
  constructor(
    private readonly createUseCase: CreateEventPlanUseCase,
    private readonly getUseCase: GetEventPlanUseCase,
    private readonly addBudgetItemUseCase: AddBudgetItemUseCase,
    private readonly generateThemeUseCase: GenerateThemeIdeasUseCase,
    private readonly repository: IEventPlanRepository,
    private readonly generateFullPlanUseCase?: GenerateFullPlanUseCase
  ) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plan = await this.createUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        data: plan,
        message: 'Event plan created successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const planId = req.params['id'] as string;
      const plan = await this.getUseCase.execute(planId);
      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventType = req.query['eventType'] as EventType | undefined;
      const plans = eventType
        ? await this.repository.findByEventType(eventType)
        : await this.repository.findAll();

      res.status(200).json({
        success: true,
        count: plans.length,
        data: plans.map((p) => p.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  };

  public addBudgetItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const planId = req.params['id'] as string;
      const enforceLimit = req.query['enforceLimit'] === 'true';
      const updatedPlan = await this.addBudgetItemUseCase.execute(planId, req.body, enforceLimit);

      res.status(200).json({
        success: true,
        data: updatedPlan,
        message: 'Budget line item appended successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  public generateThemes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const planId = req.params['id'] as string;
      const updatedPlan = await this.generateThemeUseCase.execute({
        eventPlanId: planId,
        preferences: req.body?.preferences,
      });

      res.status(200).json({
        success: true,
        data: updatedPlan,
        message: 'AI theme concepts generated and saved successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  public generateFullPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.generateFullPlanUseCase) {
        res.status(501).json({
          success: false,
          error: {
            code: 'NOT_IMPLEMENTED',
            message: 'Full GenAI planner service is not configured.',
          },
        });
        return;
      }

      const skipCache = req.query['skipCache'] === 'true';
      const plan = await this.generateFullPlanUseCase.execute(req.body, { skipCache });

      res.status(201).json({
        success: true,
        data: plan,
        message: 'Complete AI event celebration plan generated successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
