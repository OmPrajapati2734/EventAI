import crypto from 'node:crypto';
import { Event, type EventType } from '../../domain/entities/Event.js';
import { BudgetItem } from '../../domain/entities/BudgetItem.js';
import { TimelineMilestone } from '../../domain/entities/TimelineMilestone.js';
import { EventPlan } from '../../domain/entities/EventPlan.js';
import type { IEventPlanRepository } from '../../domain/repositories/IEventPlanRepository.js';
import type { CreateEventPlanDTO, EventPlanResponseDTO } from '../dtos/eventPlan.dto.js';
import { CreateEventPlanRequestSchema } from '../../domain/schemas/eventPlan.schema.js';

export class CreateEventPlanUseCase {
  constructor(private readonly repository: IEventPlanRepository) {}

  public async execute(dto: CreateEventPlanDTO): Promise<EventPlanResponseDTO> {
    // 1. Strict Schema Validation
    const validated = CreateEventPlanRequestSchema.parse(dto);

    const eventId = crypto.randomUUID();
    const planId = crypto.randomUUID();

    // 2. Instantiate Core Event Entity
    const event = new Event({
      id: eventId,
      title: validated.title,
      eventType: validated.eventType,
      date: new Date(validated.date),
      guestCount: validated.guestCount,
      budgetLimit: validated.budgetLimit,
      currency: validated.currency,
    });

    // 3. Populate Initial Budget Items (or apply sensible defaults per event archetype)
    const budgetItems: BudgetItem[] = [];
    if (validated.initialBudgetItems && validated.initialBudgetItems.length > 0) {
      for (const item of validated.initialBudgetItems) {
        budgetItems.push(
          new BudgetItem({
            id: crypto.randomUUID(),
            category: item.category,
            allocatedAmount: item.allocatedAmount,
            actualAmount: item.actualAmount ?? 0,
            notes: item.notes,
          })
        );
      }
    } else {
      budgetItems.push(...this.getDefaultBudgetItems(validated.eventType, validated.budgetLimit));
    }

    // 4. Populate Initial Milestones (or apply curated timeline schedule)
    const milestones: TimelineMilestone[] = [];
    if (validated.initialMilestones && validated.initialMilestones.length > 0) {
      for (const m of validated.initialMilestones) {
        milestones.push(
          new TimelineMilestone({
            id: crypto.randomUUID(),
            time: m.time,
            title: m.title,
            description: m.description,
            isCompleted: m.isCompleted ?? false,
          })
        );
      }
    } else {
      milestones.push(...this.getDefaultMilestones(validated.eventType));
    }

    // 5. Build Aggregate Root
    const plan = new EventPlan({
      id: planId,
      event,
      budgetItems,
      milestones,
      vendorChecklists: [],
      themeIdeas: [],
    });

    // 6. Persist to storage
    await this.repository.save(plan);

    return plan.toJSON();
  }

  private getDefaultBudgetItems(eventType: EventType, totalBudget: number): BudgetItem[] {
    const allocations: Record<EventType, Array<{ category: string; ratio: number }>> = {
      wedding: [
        { category: 'Venue & Reception', ratio: 0.4 },
        { category: 'Catering & Beverages', ratio: 0.25 },
        { category: 'Photography & Videography', ratio: 0.15 },
        { category: 'Attire & Beauty', ratio: 0.1 },
        { category: 'Music & Entertainment', ratio: 0.1 },
      ],
      birthday: [
        { category: 'Venue & Decor', ratio: 0.35 },
        { category: 'Food & Cake', ratio: 0.35 },
        { category: 'Entertainment & Activities', ratio: 0.2 },
        { category: 'Party Favors & Invitations', ratio: 0.1 },
      ],
      community: [
        { category: 'Permits & Sanitation', ratio: 0.2 },
        { category: 'Staging & Audio/Visual', ratio: 0.3 },
        { category: 'Refreshments', ratio: 0.25 },
        { category: 'Marketing & Signage', ratio: 0.15 },
        { category: 'Safety & First Aid', ratio: 0.1 },
      ],
    };

    const rules = allocations[eventType];
    return rules.map((r) => {
      const allocated = Math.round(totalBudget * r.ratio);
      return new BudgetItem({
        id: crypto.randomUUID(),
        category: r.category,
        allocatedAmount: allocated,
        actualAmount: 0,
        notes: `Default ${Math.round(r.ratio * 100)}% allocation`,
      });
    });
  }

  private getDefaultMilestones(eventType: EventType): TimelineMilestone[] {
    const defaults: Record<EventType, Array<{ time: string; title: string; description: string }>> = {
      wedding: [
        { time: '10:00 AM', title: 'Hair & Makeup Preparations', description: 'Bridal party and groomsmen prep' },
        { time: '02:00 PM', title: 'Guest Arrival & Prelude Music', description: 'Ushering guests to seating' },
        { time: '02:30 PM', title: 'Processional & Ceremony', description: 'Exchange of vows and rings' },
        { time: '04:00 PM', title: 'Cocktail Hour & Photos', description: 'Hors d’oeuvres and formal portraits' },
        { time: '06:00 PM', title: 'Grand Entrance & Dinner Reception', description: 'Toasts, dinner service, first dance' },
      ],
      birthday: [
        { time: '03:00 PM', title: 'Decor & Sound Setup', description: 'Balloons, lighting, and playlist testing' },
        { time: '04:00 PM', title: 'Guests Arrive & Welcome Drinks', description: 'Socializing and arrival games' },
        { time: '05:30 PM', title: 'Main Activity / Game', description: 'Featured entertainment or party game' },
        { time: '06:30 PM', title: 'Cake Cutting & Birthday Song', description: 'Celebration moment and desserts' },
      ],
      community: [
        { time: '08:00 AM', title: 'Vendor & Volunteer Check-in', description: 'Booth assignments and logistics' },
        { time: '09:30 AM', title: 'Gates Open & Welcome Speech', description: 'Opening remarks from community organizers' },
        { time: '12:00 PM', title: 'Midday Showcase / Performances', description: 'Local cultural performances and food stalls' },
        { time: '04:00 PM', title: 'Closing Ceremony & Cleanup', description: 'Thanking participants and venue teardown' },
      ],
    };

    return defaults[eventType].map((m) => {
      return new TimelineMilestone({
        id: crypto.randomUUID(),
        time: m.time,
        title: m.title,
        description: m.description,
        isCompleted: false,
      });
    });
  }
}
