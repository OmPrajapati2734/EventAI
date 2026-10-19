import type { EventType } from '../../domain/entities/Event.js';
import type { VendorStatus } from '../../domain/entities/VendorChecklist.js';
import type { IEventPlanJSON } from '../../domain/entities/EventPlan.js';

export interface CreateEventPlanDTO {
  title: string;
  eventType: EventType;
  date: string;
  guestCount: number;
  budgetLimit: number;
  currency: string;
  initialBudgetItems?: Array<{
    category: string;
    allocatedAmount: number;
    actualAmount?: number;
    notes?: string;
  }>;
  initialMilestones?: Array<{
    time: string;
    title: string;
    description?: string;
    isCompleted?: boolean;
  }>;
}

export interface AddBudgetItemDTO {
  category: string;
  allocatedAmount: number;
  actualAmount?: number;
  notes?: string;
}

export interface AddMilestoneDTO {
  time: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
}

export interface AddVendorDTO {
  role: string;
  vendorName: string;
  contact: string;
  status?: VendorStatus;
  price: number;
}

export interface GenerateThemeDTO {
  eventPlanId: string;
  preferences?: string;
}

export type EventPlanResponseDTO = IEventPlanJSON;
