export interface ITimelineMilestoneProps {
  id: string;
  time: string; // ISO time or string representation like "09:00 AM" / "14:30"
  title: string;
  description?: string;
  isCompleted: boolean;
}

/**
 * TimelineMilestone Entity representing critical day-of-event schedule milestones.
 */
export class TimelineMilestone {
  public readonly id: string;
  public readonly time: string;
  public readonly title: string;
  public readonly description: string;
  public readonly isCompleted: boolean;

  constructor(props: ITimelineMilestoneProps) {
    this.validate(props);
    this.id = props.id;
    this.time = props.time.trim();
    this.title = props.title.trim();
    this.description = props.description?.trim() ?? '';
    this.isCompleted = props.isCompleted;
  }

  private validate(props: ITimelineMilestoneProps): void {
    if (!props.id || typeof props.id !== 'string') {
      throw new Error('TimelineMilestone ID must be a non-empty string.');
    }
    if (!props.time || props.time.trim().length === 0) {
      throw new Error('Milestone time cannot be empty.');
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Milestone title cannot be empty.');
    }
    if (typeof props.isCompleted !== 'boolean') {
      throw new Error('Milestone isCompleted must be a boolean.');
    }
  }

  public toggleCompletion(): TimelineMilestone {
    return new TimelineMilestone({
      id: this.id,
      time: this.time,
      title: this.title,
      description: this.description,
      isCompleted: !this.isCompleted,
    });
  }

  public toJSON(): ITimelineMilestoneProps {
    return {
      id: this.id,
      time: this.time,
      title: this.title,
      description: this.description,
      isCompleted: this.isCompleted,
    };
  }
}
