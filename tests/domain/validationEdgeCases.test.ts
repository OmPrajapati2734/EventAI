import test from 'node:test';
import assert from 'node:assert/strict';
import { Event } from '../../src/domain/entities/Event.js';
import { BudgetItem } from '../../src/domain/entities/BudgetItem.js';
import { EventPlan } from '../../src/domain/entities/EventPlan.js';
import { BusinessRuleViolationError } from '../../src/domain/errors/DomainErrors.js';
import {
  EventSchema,
  CreateEventPlanRequestSchema,
} from '../../src/domain/schemas/eventPlan.schema.js';

test('Domain Validation Edge Cases: Negative budget values are rejected', () => {
  // 1. Entity level rejection
  assert.throws(() => {
    new Event({
      id: 'evt-test-1',
      title: 'Graduation Party',
      eventType: 'birthday',
      date: new Date('2026-11-01T12:00:00Z'),
      guestCount: 50,
      budgetLimit: -1000, // Negative budget
      currency: 'USD',
    });
  }, /Budget limit must be a non-negative number/);

  // 2. BudgetItem negative amount rejection
  assert.throws(() => {
    new BudgetItem({
      id: 'b-neg-1',
      category: 'Catering',
      allocatedAmount: -500, // Negative allocation
      actualAmount: 0,
    });
  }, /Allocated amount must be a non-negative number/);

  // 3. Zod schema level rejection
  const schemaResult = EventSchema.safeParse({
    id: 'evt-test-1',
    title: 'Gala Night',
    eventType: 'community',
    date: '2026-12-01T10:00:00.000Z',
    guestCount: 200,
    budgetLimit: -5000,
    currency: 'USD',
  });
  assert.equal(schemaResult.success, false);
  if (!schemaResult.success) {
    assert.ok(
      schemaResult.error.issues.some((i) => i.message.includes('Budget limit cannot be negative'))
    );
  }
});

test('Domain Validation Edge Cases: Invalid event types are rejected', () => {
  // 1. Entity level
  assert.throws(() => {
    new Event({
      id: 'evt-test-2',
      title: 'Corporate Conference',
      eventType: 'corporate' as any, // Unsupported archetype
      date: new Date('2026-11-01T12:00:00Z'),
      guestCount: 100,
      budgetLimit: 10000,
      currency: 'USD',
    });
  }, /Invalid eventType "corporate"/);

  // 2. Zod request level
  const zodResult = CreateEventPlanRequestSchema.safeParse({
    title: 'Summer Festival',
    eventType: 'festival' as any,
    date: '2026-08-01T10:00:00.000Z',
    guestCount: 150,
    budgetLimit: 15000,
    currency: 'USD',
  });
  assert.equal(zodResult.success, false);
});

test('Domain Validation Edge Cases: Dates in the past or invalid date formats', () => {
  // Invalid string date parse
  assert.throws(() => {
    new Event({
      id: 'evt-test-3',
      title: 'Past Event',
      eventType: 'wedding',
      date: 'invalid-date-string' as any,
      guestCount: 75,
      budgetLimit: 12000,
      currency: 'USD',
    });
  }, /Event date must be a valid date/);

  // Zod datetime validation rejects non-ISO formats
  const invalidDateResult = CreateEventPlanRequestSchema.safeParse({
    title: 'Autumn Gathering',
    eventType: 'community',
    date: 'yesterday',
    guestCount: 50,
    budgetLimit: 5000,
    currency: 'USD',
  });
  assert.equal(invalidDateResult.success, false);
});

test('Budget Calculation Utilities: Verifying allocations, variances, and overflow alerts', () => {
  const event = new Event({
    id: 'evt-calc-1',
    title: 'Golden Anniversary Gala',
    eventType: 'wedding',
    date: new Date('2026-12-15T18:00:00Z'),
    guestCount: 100,
    budgetLimit: 10000,
    currency: 'USD',
  });

  const plan = new EventPlan({
    id: 'plan-calc-1',
    event,
  });

  // Adding line items
  plan.addBudgetItem(
    new BudgetItem({
      id: 'b-1',
      category: 'Venue Rental',
      allocatedAmount: 4000,
      actualAmount: 3800, // Under by 200
    })
  );

  plan.addBudgetItem(
    new BudgetItem({
      id: 'b-2',
      category: 'Banquet Catering',
      allocatedAmount: 5000,
      actualAmount: 5300, // Over by 300
    })
  );

  // Total allocated: 4000 + 5000 = 9000
  assert.equal(plan.totalAllocatedBudget, 9000);
  // Total actual: 3800 + 5300 = 9100
  assert.equal(plan.totalActualBudget, 9100);
  // Remaining buffer: 10000 - 9000 = 1000
  assert.equal(plan.remainingBudget, 1000);

  // Check variance calculation on individual items
  const item1 = plan.budgetItems.find((b) => b.id === 'b-1')!;
  assert.equal(item1.variance, 200);
  assert.equal(item1.isOverBudget, false);

  const item2 = plan.budgetItems.find((b) => b.id === 'b-2')!;
  assert.equal(item2.variance, -300);
  assert.equal(item2.isOverBudget, true);

  // Overflow alert rule enforcement: attempting to add 1500 when only 1000 buffer remains
  assert.throws(() => {
    plan.addBudgetItem(
      new BudgetItem({
        id: 'b-3',
        category: 'Live Jazz Band',
        allocatedAmount: 1500, // 9000 + 1500 = 10500 > 10000
        actualAmount: 0,
      }),
      true // enforceBudgetLimit = true
    );
  }, BusinessRuleViolationError);
});
