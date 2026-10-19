export type EventType = 'wedding' | 'birthday' | 'community';

export interface IEventProps {
  id: string;
  title: string;
  eventType: EventType;
  date: Date;
  guestCount: number;
  budgetLimit: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Event Entity representing core metadata and scope of celebration.
 */
export class Event {
  public readonly id: string;
  public readonly title: string;
  public readonly eventType: EventType;
  public readonly date: Date;
  public readonly guestCount: number;
  public readonly budgetLimit: number;
  public readonly currency: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: IEventProps) {
    this.validate(props);
    this.id = props.id;
    this.title = props.title.trim();
    this.eventType = props.eventType;
    this.date = new Date(props.date);
    this.guestCount = props.guestCount;
    this.budgetLimit = props.budgetLimit;
    this.currency = props.currency.toUpperCase().trim();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  private validate(props: IEventProps): void {
    if (!props.id || typeof props.id !== 'string') {
      throw new Error('Event ID must be a non-empty string.');
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Event title cannot be empty.');
    }
    if (!['wedding', 'birthday', 'community'].includes(props.eventType)) {
      throw new Error(`Invalid eventType "${props.eventType}". Allowed types: wedding, birthday, community.`);
    }
    if (!(props.date instanceof Date) && isNaN(Date.parse(props.date as unknown as string))) {
      throw new Error('Event date must be a valid date.');
    }
    if (typeof props.guestCount !== 'number' || props.guestCount <= 0 || !Number.isInteger(props.guestCount)) {
      throw new Error('Guest count must be a positive integer.');
    }
    if (typeof props.budgetLimit !== 'number' || props.budgetLimit < 0) {
      throw new Error('Budget limit must be a non-negative number.');
    }
    if (!props.currency || props.currency.trim().length !== 3) {
      throw new Error('Currency must be a valid 3-letter ISO currency code (e.g., USD, EUR, INR).');
    }
  }

  public toJSON(): IEventProps {
    return {
      id: this.id,
      title: this.title,
      eventType: this.eventType,
      date: this.date,
      guestCount: this.guestCount,
      budgetLimit: this.budgetLimit,
      currency: this.currency,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
