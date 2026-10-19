import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryEventPlanRepository } from '../../src/infrastructure/repositories/InMemoryEventPlanRepository.js';
import { GeminiAiService } from '../../src/infrastructure/ai/GeminiAiService.js';
import { CreateEventPlanUseCase } from '../../src/application/use-cases/CreateEventPlanUseCase.js';
import { GetEventPlanUseCase } from '../../src/application/use-cases/GetEventPlanUseCase.js';
import { AddBudgetItemUseCase } from '../../src/application/use-cases/AddBudgetItemUseCase.js';
import { GenerateThemeIdeasUseCase } from '../../src/application/use-cases/GenerateThemeIdeasUseCase.js';
import { EntityNotFoundError, BusinessRuleViolationError } from '../../src/domain/errors/DomainErrors.js';

test('Application: CreateEventPlanUseCase generates curated defaults per event type', async () => {
  const repository = new InMemoryEventPlanRepository();
  const useCase = new CreateEventPlanUseCase(repository);

  // 1. Wedding Celebration
  const weddingPlan = await useCase.execute({
    title: 'Liam & Olivia Vintage Wedding',
    eventType: 'wedding',
    date: '2026-10-15T16:00:00.000Z',
    guestCount: 120,
    budgetLimit: 25000,
    currency: 'USD',
  });

  assert.equal(weddingPlan.event.title, 'Liam & Olivia Vintage Wedding');
  assert.equal(weddingPlan.event.eventType, 'wedding');
  assert.equal(weddingPlan.budgetItems.length, 5); // 5 default wedding categories
  assert.equal(weddingPlan.milestones.length, 5); // 5 default wedding milestones
  assert.equal(weddingPlan.totalAllocatedBudget, 25000);
  assert.equal(weddingPlan.remainingBudget, 0);

  // 2. Community Gathering
  const communityPlan = await useCase.execute({
    title: 'Downtown Green Earth Festival',
    eventType: 'community',
    date: '2026-09-01T09:00:00.000Z',
    guestCount: 500,
    budgetLimit: 12000,
    currency: 'USD',
  });

  assert.equal(communityPlan.event.eventType, 'community');
  assert.ok(communityPlan.budgetItems.some((b) => b.category === 'Permits & Sanitation'));
  assert.ok(communityPlan.milestones.some((m) => m.title.includes('Volunteer Check-in')));
});

test('Application: GetEventPlanUseCase finds existing and rejects missing', async () => {
  const repository = new InMemoryEventPlanRepository();
  const createUseCase = new CreateEventPlanUseCase(repository);
  const getUseCase = new GetEventPlanUseCase(repository);

  const created = await createUseCase.execute({
    title: 'Lucas 5th Birthday Astronaut Adventure',
    eventType: 'birthday',
    date: '2026-08-12T14:00:00.000Z',
    guestCount: 25,
    budgetLimit: 1500,
    currency: 'USD',
  });

  const found = await getUseCase.execute(created.id);
  assert.equal(found.id, created.id);
  assert.equal(found.event.title, 'Lucas 5th Birthday Astronaut Adventure');

  await assert.rejects(async () => {
    await getUseCase.execute('non-existent-uuid');
  }, EntityNotFoundError);
});

test('Application: AddBudgetItemUseCase appends items and handles limit rule', async () => {
  const repository = new InMemoryEventPlanRepository();
  const createUseCase = new CreateEventPlanUseCase(repository);
  const addBudgetItemUseCase = new AddBudgetItemUseCase(repository);

  const plan = await createUseCase.execute({
    title: 'Neighborhood Block Party',
    eventType: 'community',
    date: '2026-07-04T12:00:00.000Z',
    guestCount: 200,
    budgetLimit: 5000,
    currency: 'USD',
    initialBudgetItems: [
      { category: 'Food Truck Subsidy', allocatedAmount: 2000, actualAmount: 1800 },
    ],
  });

  assert.equal(plan.budgetItems.length, 1);
  assert.equal(plan.remainingBudget, 3000);

  // Add line item within budget
  const updated = await addBudgetItemUseCase.execute(plan.id, {
    category: 'Inflatable Obstacle Course',
    allocatedAmount: 1000,
    actualAmount: 1000,
    notes: 'Booked with FunRentals LLC',
  });

  assert.equal(updated.budgetItems.length, 2);
  assert.equal(updated.remainingBudget, 2000);

  // Attempt to add line item exceeding budget with enforcement enabled
  await assert.rejects(async () => {
    await addBudgetItemUseCase.execute(
      plan.id,
      {
        category: 'Fireworks Display',
        allocatedAmount: 3000, // Remaining is 2000, so 3000 exceeds limit
        actualAmount: 0,
      },
      true // enforceLimit = true
    );
  }, BusinessRuleViolationError);
});

test('Application: GenerateThemeIdeasUseCase attaches AI ideas via Gemini service', async () => {
  const repository = new InMemoryEventPlanRepository();
  const aiService = new GeminiAiService('test_gemini_api_key_12345');
  const createUseCase = new CreateEventPlanUseCase(repository);
  const generateUseCase = new GenerateThemeIdeasUseCase(repository, aiService);

  const plan = await createUseCase.execute({
    title: 'Clara & Ethan Secret Garden Wedding',
    eventType: 'wedding',
    date: '2026-06-21T17:00:00.000Z',
    guestCount: 140,
    budgetLimit: 28000,
    currency: 'USD',
  });

  assert.equal(plan.themeIdeas.length, 0);

  const updatedPlan = await generateUseCase.execute({
    eventPlanId: plan.id,
    preferences: 'Enchanted woodland fairy tale aesthetic with fairy lights and earthy tones',
  });

  assert.ok(updatedPlan.themeIdeas.length >= 2);
  assert.ok(updatedPlan.themeIdeas[0]!.title.length > 0);
  assert.ok(updatedPlan.themeIdeas[0]!.colorPalette.length > 0);
  assert.ok(updatedPlan.themeIdeas[0]!.decorationSuggestions.length > 0);
});
