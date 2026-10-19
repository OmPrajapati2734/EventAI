import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GeminiEventPlannerService,
  type IGeminiClient,
} from '../../src/infrastructure/ai/GeminiEventPlannerService.js';

test('Gemini Integration: Schema parsing handles complete structured response', async () => {
  const mockResponse = {
    budgetItems: [
      { category: 'Venue', allocatedAmount: 5000, notes: 'Main ballroom' },
      { category: 'Catering', allocatedAmount: 4000, notes: 'Buffet service' },
    ],
    milestones: [
      { time: '12:00 PM', title: 'Arrival', description: 'Guests assemble' },
      { time: '02:00 PM', title: 'Main Ceremony', description: 'Ceremony begins' },
    ],
    vendorChecklist: [
      { role: 'Caterer', vendorName: 'Chef Deluxe', contact: 'chef@deluxe.com', status: 'pending', price: 4000 },
    ],
    themeIdeas: [
      {
        title: 'Modern Minimalist',
        description: 'Clean lines and monochromatic tones.',
        colorPalette: ['#000000', '#FFFFFF', '#CCCCCC'],
        decorationSuggestions: ['Geometric arches'],
        vibeKeywords: ['Clean', 'Modern'],
      },
    ],
  };

  const client: IGeminiClient = {
    getGenerativeModel: () => ({
      generateContent: async () => ({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      }),
    }),
  };

  const service = new GeminiEventPlannerService({ client });
  const plan = await service.generatePlan({
    title: 'Spring Banquet',
    eventType: 'community',
    date: '2026-05-15T12:00:00Z',
    guestCount: 80,
    budgetLimit: 10000,
    currency: 'USD',
  });

  assert.equal(plan.event.title, 'Spring Banquet');
  assert.equal(plan.budgetItems.length, 2);
  assert.equal(plan.milestones.length, 2);
  assert.equal(plan.vendorChecklists.length, 1);
  assert.equal(plan.themeIdeas.length, 1);
  assert.equal(plan.totalAllocatedBudget, 9000);
});

test('Gemini Integration: Error handling when API returns malformed JSON engages graceful fallback', async () => {
  const client: IGeminiClient = {
    getGenerativeModel: () => ({
      generateContent: async () => ({
        response: {
          text: () => '{ invalid json syntax: missing quotes and brackets',
        },
      }),
    }),
  };

  const service = new GeminiEventPlannerService({ client });
  // Should not crash, but gracefully fall back to deterministic archetype plan
  const plan = await service.generatePlan({
    title: 'Autumn Harvest Gathering',
    eventType: 'community',
    date: '2026-10-10T10:00:00Z',
    guestCount: 250,
    budgetLimit: 8000,
    currency: 'USD',
  });

  assert.ok(plan);
  assert.equal(plan.event.eventType, 'community');
  assert.ok(plan.budgetItems.length >= 4);
  assert.equal(plan.totalAllocatedBudget, 8000);
});

test('Gemini Integration: Handling HTTP 429 Rate Limit / Quota Exceeded engages fallback without crashing', async () => {
  const client: IGeminiClient = {
    getGenerativeModel: () => ({
      generateContent: async () => {
        const rateLimitError = new Error('429 Too Many Requests: RESOURCE_EXHAUSTED');
        (rateLimitError as any).status = 429;
        throw rateLimitError;
      },
    }),
  };

  const service = new GeminiEventPlannerService({ client });
  const plan = await service.generatePlan({
    title: 'Elena & Lucas Wedding',
    eventType: 'wedding',
    date: '2026-09-20T16:00:00Z',
    guestCount: 120,
    budgetLimit: 30000,
    currency: 'USD',
  });

  assert.ok(plan);
  assert.equal(plan.event.eventType, 'wedding');
  assert.equal(plan.budgetItems.length, 5);
  assert.equal(plan.totalAllocatedBudget, 30000);
  assert.equal(plan.milestones.length, 5);
});
