import test from 'node:test';
import assert from 'node:assert/strict';
import { Event } from '../../src/domain/entities/Event.js';
import { BudgetItem } from '../../src/domain/entities/BudgetItem.js';
import { TimelineMilestone } from '../../src/domain/entities/TimelineMilestone.js';
import { VendorChecklist } from '../../src/domain/entities/VendorChecklist.js';
import { ThemeIdea } from '../../src/domain/entities/ThemeIdea.js';
import { EventPlan } from '../../src/domain/entities/EventPlan.js';
import { BusinessRuleViolationError } from '../../src/domain/errors/DomainErrors.js';

test('Domain Entity: Event instantiation and validation', () => {
  const event = new Event({
    id: 'evt-1',
    title: 'Sarah & Alex Wedding Celebration',
    eventType: 'wedding',
    date: new Date('2026-11-20T14:00:00Z'),
    guestCount: 150,
    budgetLimit: 30000,
    currency: 'USD',
  });

  assert.equal(event.id, 'evt-1');
  assert.equal(event.eventType, 'wedding');
  assert.equal(event.guestCount, 150);
  assert.equal(event.budgetLimit, 30000);
  assert.equal(event.currency, 'USD');

  // Negative tests
  assert.throws(() => {
    new Event({
      id: '',
      title: 'Invalid',
      eventType: 'wedding',
      date: new Date(),
      guestCount: 10,
      budgetLimit: 1000,
      currency: 'USD',
    });
  }, /Event ID must be a non-empty string/);

  assert.throws(() => {
    new Event({
      id: 'evt-2',
      title: 'Invalid',
      eventType: 'conference' as any,
      date: new Date(),
      guestCount: 10,
      budgetLimit: 1000,
      currency: 'USD',
    });
  }, /Invalid eventType/);
});

test('Domain Entity: BudgetItem variance and calculation', () => {
  const item = new BudgetItem({
    id: 'b-1',
    category: 'Floral & Decor',
    allocatedAmount: 2500,
    actualAmount: 2200,
    notes: 'Under budget deal negotiated',
  });

  assert.equal(item.variance, 300);
  assert.equal(item.isOverBudget, false);

  const overItem = new BudgetItem({
    id: 'b-2',
    category: 'Catering',
    allocatedAmount: 5000,
    actualAmount: 5600,
  });

  assert.equal(overItem.variance, -600);
  assert.equal(overItem.isOverBudget, true);
});

test('Domain Entity: TimelineMilestone toggling', () => {
  const milestone = new TimelineMilestone({
    id: 'm-1',
    time: '14:30',
    title: 'Ceremony Begins',
    isCompleted: false,
  });

  assert.equal(milestone.isCompleted, false);
  const toggled = milestone.toggleCompletion();
  assert.equal(toggled.isCompleted, true);
});

test('Domain Aggregate Root: EventPlan budget and milestone invariants', () => {
  const event = new Event({
    id: 'evt-100',
    title: 'Maya 30th Birthday Bash',
    eventType: 'birthday',
    date: new Date('2026-12-05T19:00:00Z'),
    guestCount: 60,
    budgetLimit: 5000,
    currency: 'USD',
  });

  const plan = new EventPlan({
    id: 'plan-100',
    event,
  });

  assert.equal(plan.totalAllocatedBudget, 0);
  assert.equal(plan.remainingBudget, 5000);
  assert.equal(plan.milestoneCompletionPercentage, 0);

  // Add budget items
  plan.addBudgetItem(
    new BudgetItem({
      id: 'b-101',
      category: 'Venue Rental',
      allocatedAmount: 2000,
      actualAmount: 1950,
    })
  );

  plan.addBudgetItem(
    new BudgetItem({
      id: 'b-102',
      category: 'Catering & Cake',
      allocatedAmount: 1800,
      actualAmount: 1800,
    })
  );

  assert.equal(plan.totalAllocatedBudget, 3800);
  assert.equal(plan.remainingBudget, 1200);

  // Enforce budget limit validation
  assert.throws(() => {
    plan.addBudgetItem(
      new BudgetItem({
        id: 'b-103',
        category: 'Live Band',
        allocatedAmount: 1500, // 3800 + 1500 = 5300 > 5000 limit
        actualAmount: 0,
      }),
      true // enforceBudgetLimit
    );
  }, BusinessRuleViolationError);

  // Add milestones and verify completion percentage
  plan.addMilestone(
    new TimelineMilestone({
      id: 'm-1',
      time: '18:00',
      title: 'Soundcheck',
      isCompleted: true,
    })
  );
  plan.addMilestone(
    new TimelineMilestone({
      id: 'm-2',
      time: '19:00',
      title: 'Guests Arrival',
      isCompleted: false,
    })
  );

  assert.equal(plan.milestoneCompletionPercentage, 50);

  // Toggle milestone m-2 to complete
  plan.toggleMilestone('m-2');
  assert.equal(plan.milestoneCompletionPercentage, 100);

  // Add Vendor & Theme Idea
  plan.addVendor(
    new VendorChecklist({
      id: 'v-1',
      role: 'DJ',
      vendorName: 'Groove Collective',
      contact: 'booking@groove.com',
      status: 'booked',
      price: 800,
    })
  );

  plan.setThemeIdeas([
    new ThemeIdea({
      id: 't-1',
      title: 'Golden Hour Sunset',
      description: 'Warm lighting and amber accents',
      colorPalette: ['#FFA07A', '#FFD700'],
      decorationSuggestions: ['Sunset lanterns'],
      vibeKeywords: ['Warm', 'Cozy'],
    }),
  ]);

  const serialized = plan.toJSON();
  assert.equal(serialized.id, 'plan-100');
  assert.equal(serialized.vendorChecklists.length, 1);
  assert.equal(serialized.themeIdeas.length, 1);
  assert.equal(serialized.remainingBudget, 1200);
});
