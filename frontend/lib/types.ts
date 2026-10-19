export type EventType = 'wedding' | 'birthday' | 'community';

export type VendorStatus =
  | 'pending'
  | 'contract_sent'
  | 'contacted'
  | 'confirmed'
  | 'booked'
  | 'paid'
  | 'rejected'
  | 'completed';

export interface BudgetItem {
  id: string;
  category: string;
  allocatedAmount: number;
  actualAmount: number;
  notes?: string;
}

export type MilestonePhase = 'planning' | 'final_prep' | 'event_day';

export interface TimelineMilestone {
  id: string;
  time: string;
  title: string;
  description: string;
  isCompleted: boolean;
  phase?: MilestonePhase;
}

export interface VendorChecklist {
  id: string;
  role: string;
  vendorName: string;
  contact: string;
  status: VendorStatus;
  price: number;
  notes?: string;
}

export interface ThemeIdea {
  id: string;
  title: string;
  description: string;
  colorPalette: string[];
  decorationSuggestions: string[];
  vibeKeywords: string[];
  entertainmentIdeas?: string[];
  activityIdeas?: string[];
}

export interface EventPlan {
  id: string;
  event: {
    id: string;
    title: string;
    eventType: EventType;
    date: string | Date;
    guestCount: number;
    budgetLimit: number;
    currency: string;
  };
  budgetItems: BudgetItem[];
  milestones: TimelineMilestone[];
  vendorChecklists: VendorChecklist[];
  themeIdeas: ThemeIdea[];
  totalAllocatedBudget: number;
  totalActualBudget: number;
  remainingBudget: number;
  milestoneCompletionPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SetupWizardData {
  title: string;
  eventType: EventType;
  date: string;
  guestCount: number;
  budgetLimit: number;
  currency: string;
  culturalContext?: string;
  userPreferences?: string;
  vibePills?: string[];
}
