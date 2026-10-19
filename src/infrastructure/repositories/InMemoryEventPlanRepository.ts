import type { IEventPlanRepository } from '../../domain/repositories/IEventPlanRepository.js';
import { EventPlan } from '../../domain/entities/EventPlan.js';
import { Event, type EventType } from '../../domain/entities/Event.js';
import { BudgetItem } from '../../domain/entities/BudgetItem.js';
import { TimelineMilestone } from '../../domain/entities/TimelineMilestone.js';
import { VendorChecklist } from '../../domain/entities/VendorChecklist.js';
import { ThemeIdea } from '../../domain/entities/ThemeIdea.js';

/**
 * High-performance, zero-dependency In-Memory Mock Repository.
 * Employs deep-cloning snapshotting on reads and writes to enforce immutability
 * and prevent external state pollution across parallel tests.
 */
export class InMemoryEventPlanRepository implements IEventPlanRepository {
  private readonly storage = new Map<string, string>();

  /**
   * Serializes and saves the aggregate root snapshot.
   */
  public async save(plan: EventPlan): Promise<void> {
    const serialized = JSON.stringify(plan.toJSON());
    this.storage.set(plan.id, serialized);
  }

  /**
   * Reconstitutes the aggregate root from a snapshot.
   */
  public async findById(id: string): Promise<EventPlan | null> {
    const raw = this.storage.get(id);
    if (!raw) {
      return null;
    }
    return this.deserialize(raw);
  }

  public async findByEventType(eventType: EventType): Promise<EventPlan[]> {
    const results: EventPlan[] = [];
    for (const raw of this.storage.values()) {
      const plan = this.deserialize(raw);
      if (plan.event.eventType === eventType) {
        results.push(plan);
      }
    }
    return results;
  }

  public async findAll(): Promise<EventPlan[]> {
    const results: EventPlan[] = [];
    for (const raw of this.storage.values()) {
      results.push(this.deserialize(raw));
    }
    return results;
  }

  public async delete(id: string): Promise<boolean> {
    return this.storage.delete(id);
  }

  public async exists(id: string): Promise<boolean> {
    return this.storage.has(id);
  }

  public async clear(): Promise<void> {
    this.storage.clear();
  }

  /**
   * Re-hydrates domain entities and aggregate root from serialized JSON.
   */
  private deserialize(jsonString: string): EventPlan {
    const data = JSON.parse(jsonString);

    const event = new Event({
      id: data.event.id,
      title: data.event.title,
      eventType: data.event.eventType,
      date: new Date(data.event.date),
      guestCount: data.event.guestCount,
      budgetLimit: data.event.budgetLimit,
      currency: data.event.currency,
      createdAt: new Date(data.event.createdAt),
      updatedAt: new Date(data.event.updatedAt),
    });

    const budgetItems = (data.budgetItems || []).map(
      (b: any) =>
        new BudgetItem({
          id: b.id,
          category: b.category,
          allocatedAmount: b.allocatedAmount,
          actualAmount: b.actualAmount,
          notes: b.notes,
        })
    );

    const milestones = (data.milestones || []).map(
      (m: any) =>
        new TimelineMilestone({
          id: m.id,
          time: m.time,
          title: m.title,
          description: m.description,
          isCompleted: m.isCompleted,
        })
    );

    const vendorChecklists = (data.vendorChecklists || []).map(
      (v: any) =>
        new VendorChecklist({
          id: v.id,
          role: v.role,
          vendorName: v.vendorName,
          contact: v.contact,
          status: v.status,
          price: v.price,
        })
    );

    const themeIdeas = (data.themeIdeas || []).map(
      (t: any) =>
        new ThemeIdea({
          id: t.id,
          title: t.title,
          description: t.description,
          colorPalette: t.colorPalette,
          decorationSuggestions: t.decorationSuggestions,
          vibeKeywords: t.vibeKeywords,
        })
    );

    return new EventPlan({
      id: data.id,
      event,
      budgetItems,
      milestones,
      vendorChecklists,
      themeIdeas,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }
}
