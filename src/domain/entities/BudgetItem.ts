export interface IBudgetItemProps {
  id: string;
  category: string;
  allocatedAmount: number;
  actualAmount: number;
  notes?: string;
}

/**
 * BudgetItem Entity representing granular financial allocation for an event line item.
 */
export class BudgetItem {
  public readonly id: string;
  public readonly category: string;
  public readonly allocatedAmount: number;
  public readonly actualAmount: number;
  public readonly notes: string;

  constructor(props: IBudgetItemProps) {
    this.validate(props);
    this.id = props.id;
    this.category = props.category.trim();
    this.allocatedAmount = props.allocatedAmount;
    this.actualAmount = props.actualAmount;
    this.notes = props.notes?.trim() ?? '';
  }

  private validate(props: IBudgetItemProps): void {
    if (!props.id || typeof props.id !== 'string') {
      throw new Error('BudgetItem ID must be a non-empty string.');
    }
    if (!props.category || props.category.trim().length === 0) {
      throw new Error('BudgetItem category must not be empty.');
    }
    if (typeof props.allocatedAmount !== 'number' || props.allocatedAmount < 0) {
      throw new Error('Allocated amount must be a non-negative number.');
    }
    if (typeof props.actualAmount !== 'number' || props.actualAmount < 0) {
      throw new Error('Actual amount must be a non-negative number.');
    }
  }

  /**
   * Returns financial variance: positive means within budget, negative means over budget.
   */
  public get variance(): number {
    return this.allocatedAmount - this.actualAmount;
  }

  public get isOverBudget(): boolean {
    return this.actualAmount > this.allocatedAmount;
  }

  public toJSON(): IBudgetItemProps {
    return {
      id: this.id,
      category: this.category,
      allocatedAmount: this.allocatedAmount,
      actualAmount: this.actualAmount,
      notes: this.notes,
    };
  }
}
