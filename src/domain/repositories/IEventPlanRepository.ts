import { EventPlan } from '../entities/EventPlan.js';
import { type EventType } from '../entities/Event.js';

/**
 * Repository Port for EventPlan Aggregate Root.
 * Defines enterprise storage abstraction independent of database technologies.
 */
export interface IEventPlanRepository {
  /**
   * Persists or updates an EventPlan aggregate root.
   */
  save(plan: EventPlan): Promise<void>;

  /**
   * Retrieves an EventPlan by its unique identifier.
   */
  findById(id: string): Promise<EventPlan | null>;

  /**
   * Finds all event plans filtered by specific event classification.
   */
  findByEventType(eventType: EventType): Promise<EventPlan[]>;

  /**
   * Returns all persisted event plans.
   */
  findAll(): Promise<EventPlan[]>;

  /**
   * Removes an event plan by identifier. Returns true if removed, false otherwise.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Checks existence of an event plan by id.
   */
  exists(id: string): Promise<boolean>;

  /**
   * Clears all stored records (primarily for test environments).
   */
  clear(): Promise<void>;
}
