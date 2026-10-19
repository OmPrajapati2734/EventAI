import { Event, type IEventProps } from './Event.js';
import { BudgetItem, type IBudgetItemProps } from './BudgetItem.js';
import { TimelineMilestone, type ITimelineMilestoneProps } from './TimelineMilestone.js';
import { VendorChecklist, type IVendorChecklistProps } from './VendorChecklist.js';
import { ThemeIdea, type IThemeIdeaProps } from './ThemeIdea.js';
import { BusinessRuleViolationError } from '../errors/DomainErrors.js';

export interface IEventPlanProps {
  id: string;
  event: Event;
  budgetItems?: BudgetItem[];
  milestones?: TimelineMilestone[];
  vendorChecklists?: VendorChecklist[];
  themeIdeas?: ThemeIdea[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEventPlanJSON {
  id: string;
  event: IEventProps;
  budgetItems: IBudgetItemProps[];
  milestones: ITimelineMilestoneProps[];
  vendorChecklists: IVendorChecklistProps[];
  themeIdeas: IThemeIdeaProps[];
  totalAllocatedBudget: number;
  totalActualBudget: number;
  remainingBudget: number;
  milestoneCompletionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * EventPlan Aggregate Root
 * Enforces transactional boundaries and domain invariants for celebrations.
 */
export class EventPlan {
  public readonly id: string;
  private _event: Event;
  private _budgetItems: Map<string, BudgetItem>;
  private _milestones: Map<string, TimelineMilestone>;
  private _vendorChecklists: Map<string, VendorChecklist>;
  private _themeIdeas: Map<string, ThemeIdea>;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: IEventPlanProps) {
    if (!props.id || typeof props.id !== 'string') {
      throw new Error('EventPlan ID must be a non-empty string.');
    }
    this.id = props.id;
    this._event = props.event;
    this._budgetItems = new Map((props.budgetItems ?? []).map(b => [b.id, b]));
    this._milestones = new Map((props.milestones ?? []).map(m => [m.id, m]));
    this._vendorChecklists = new Map((props.vendorChecklists ?? []).map(v => [v.id, v]));
    this._themeIdeas = new Map((props.themeIdeas ?? []).map(t => [t.id, t]));
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  // Getters
  public get event(): Event {
    return this._event;
  }

  public get budgetItems(): BudgetItem[] {
    return Array.from(this._budgetItems.values());
  }

  public get milestones(): TimelineMilestone[] {
    return Array.from(this._milestones.values());
  }

  public get vendorChecklists(): VendorChecklist[] {
    return Array.from(this._vendorChecklists.values());
  }

  public get themeIdeas(): ThemeIdea[] {
    return Array.from(this._themeIdeas.values());
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Financial Domain Invariants
  public get totalAllocatedBudget(): number {
    return this.budgetItems.reduce((sum, item) => sum + item.allocatedAmount, 0);
  }

  public get totalActualBudget(): number {
    return this.budgetItems.reduce((sum, item) => sum + item.actualAmount, 0);
  }

  public get remainingBudget(): number {
    return this._event.budgetLimit - this.totalAllocatedBudget;
  }

  public get milestoneCompletionPercentage(): number {
    const total = this._milestones.size;
    if (total === 0) return 0;
    const completed = this.milestones.filter(m => m.isCompleted).length;
    return Math.round((completed / total) * 100);
  }

  // Aggregate Mutation Methods
  public addBudgetItem(item: BudgetItem, enforceBudgetLimit = false): void {
    if (this._budgetItems.has(item.id)) {
      throw new BusinessRuleViolationError(`BudgetItem with ID "${item.id}" already exists.`);
    }

    if (enforceBudgetLimit && (this.totalAllocatedBudget + item.allocatedAmount > this._event.budgetLimit)) {
      throw new BusinessRuleViolationError(
        `Adding this item would exceed the event budget limit of ${this._event.budgetLimit} ${this._event.currency}.`
      );
    }

    this._budgetItems.set(item.id, item);
    this.touch();
  }

  public updateBudgetItem(item: BudgetItem): void {
    if (!this._budgetItems.has(item.id)) {
      throw new BusinessRuleViolationError(`BudgetItem with ID "${item.id}" not found in this event plan.`);
    }
    this._budgetItems.set(item.id, item);
    this.touch();
  }

  public removeBudgetItem(itemId: string): void {
    if (!this._budgetItems.has(itemId)) {
      throw new BusinessRuleViolationError(`BudgetItem with ID "${itemId}" does not exist.`);
    }
    this._budgetItems.delete(itemId);
    this.touch();
  }

  public addMilestone(milestone: TimelineMilestone): void {
    if (this._milestones.has(milestone.id)) {
      throw new BusinessRuleViolationError(`Milestone with ID "${milestone.id}" already exists.`);
    }
    this._milestones.set(milestone.id, milestone);
    this.touch();
  }

  public toggleMilestone(milestoneId: string): void {
    const existing = this._milestones.get(milestoneId);
    if (!existing) {
      throw new BusinessRuleViolationError(`Milestone with ID "${milestoneId}" does not exist.`);
    }
    this._milestones.set(milestoneId, existing.toggleCompletion());
    this.touch();
  }

  public addVendor(vendor: VendorChecklist): void {
    if (this._vendorChecklists.has(vendor.id)) {
      throw new BusinessRuleViolationError(`Vendor with ID "${vendor.id}" already exists.`);
    }
    this._vendorChecklists.set(vendor.id, vendor);
    this.touch();
  }

  public setThemeIdeas(ideas: ThemeIdea[]): void {
    this._themeIdeas.clear();
    for (const idea of ideas) {
      this._themeIdeas.set(idea.id, idea);
    }
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  public toJSON(): IEventPlanJSON {
    return {
      id: this.id,
      event: this._event.toJSON(),
      budgetItems: this.budgetItems.map(b => b.toJSON()),
      milestones: this.milestones.map(m => m.toJSON()),
      vendorChecklists: this.vendorChecklists.map(v => v.toJSON()),
      themeIdeas: this.themeIdeas.map(t => t.toJSON()),
      totalAllocatedBudget: this.totalAllocatedBudget,
      totalActualBudget: this.totalActualBudget,
      remainingBudget: this.remainingBudget,
      milestoneCompletionPercentage: this.milestoneCompletionPercentage,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
