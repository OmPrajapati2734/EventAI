import { z } from 'zod';

/**
 * Common string schema with prototype-pollution prevention, length restriction, and trim.
 */
export const safeText = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, { message: `Text must be at least ${min} characters long` })
    .max(max, { message: `Text cannot exceed ${max} characters` })
    .refine((val) => !/[<>]/.test(val), {
      message: 'HTML/XML tags (< or >) are strictly prohibited for XSS prevention.',
    });

/**
 * ISO 4217 Currency Code Validation Schema
 */
export const CurrencySchema = z
  .string()
  .trim()
  .length(3, { message: 'Currency code must be exactly 3 uppercase letters (e.g. USD, EUR, INR).' })
  .regex(/^[A-Z]{3}$/, { message: 'Currency code must contain only uppercase ASCII letters.' });

/**
 * Event Type Enumeration Schema
 */
export const EventTypeSchema = z.enum(['wedding', 'birthday', 'community']);

/**
 * Event Validation Schema (.strict() prevents prototype pollution and unexpected keys)
 */
export const EventSchema = z
  .object({
    id: safeText(1, 64),
    title: safeText(2, 120),
    eventType: EventTypeSchema,
    date: z.coerce.date().refine((d) => !isNaN(d.getTime()), {
      message: 'Invalid ISO date format.',
    }),
    guestCount: z
      .number()
      .int({ message: 'Guest count must be an integer.' })
      .positive({ message: 'Guest count must be greater than zero.' })
      .max(50000, { message: 'Guest count cannot exceed 50,000.' }),
    budgetLimit: z
      .number()
      .min(0, { message: 'Budget limit cannot be negative.' })
      .max(100_000_000, { message: 'Budget limit cannot exceed 100,000,000.' }),
    currency: CurrencySchema,
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })
  .strict();

/**
 * BudgetItem Validation Schema
 */
export const BudgetItemSchema = z
  .object({
    id: safeText(1, 64),
    category: safeText(2, 60),
    allocatedAmount: z
      .number()
      .min(0, { message: 'Allocated amount must be greater than or equal to 0.' }),
    actualAmount: z
      .number()
      .min(0, { message: 'Actual amount must be greater than or equal to 0.' })
      .default(0),
    notes: safeText(0, 500).optional().default(''),
  })
  .strict();

/**
 * TimelineMilestone Validation Schema
 */
export const TimelineMilestoneSchema = z
  .object({
    id: safeText(1, 64),
    time: safeText(1, 30),
    title: safeText(2, 100),
    description: safeText(0, 500).optional().default(''),
    isCompleted: z.boolean().default(false),
  })
  .strict();

/**
 * Vendor Status Enumeration Schema
 */
export const VendorStatusSchema = z.enum([
  'pending',
  'contacted',
  'booked',
  'rejected',
  'completed',
]);

/**
 * VendorChecklist Validation Schema
 */
export const VendorChecklistSchema = z
  .object({
    id: safeText(1, 64),
    role: safeText(2, 60),
    vendorName: safeText(2, 100),
    contact: safeText(3, 100),
    status: VendorStatusSchema.default('pending'),
    price: z.number().min(0, { message: 'Vendor price must be greater than or equal to 0.' }),
  })
  .strict();

/**
 * ThemeIdea Validation Schema
 */
export const ThemeIdeaSchema = z
  .object({
    id: safeText(1, 64),
    title: safeText(2, 100),
    description: safeText(10, 1000),
    colorPalette: z
      .array(safeText(3, 30))
      .min(1, { message: 'At least one color palette token is required.' })
      .max(10, { message: 'Color palette cannot have more than 10 tokens.' }),
    decorationSuggestions: z
      .array(safeText(3, 200))
      .min(1, { message: 'At least one decoration suggestion is required.' })
      .max(20),
    vibeKeywords: z
      .array(safeText(2, 50))
      .min(1, { message: 'At least one vibe keyword is required.' })
      .max(15),
  })
  .strict();

/**
 * EventPlan Aggregate Root Schema
 */
export const EventPlanSchema = z
  .object({
    id: safeText(1, 64),
    event: EventSchema,
    budgetItems: z.array(BudgetItemSchema).default([]),
    milestones: z.array(TimelineMilestoneSchema).default([]),
    vendorChecklists: z.array(VendorChecklistSchema).default([]),
    themeIdeas: z.array(ThemeIdeaSchema).default([]),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })
  .strict();

/**
 * Request Schemas for Use-Cases (Creation & Updates)
 */
export const CreateEventPlanRequestSchema = z
  .object({
    title: safeText(2, 120),
    eventType: EventTypeSchema,
    date: z.string().datetime({ message: 'Event date must be an ISO 8601 string.' }),
    guestCount: z.number().int().positive().max(50000),
    budgetLimit: z.number().min(0).max(100_000_000),
    currency: CurrencySchema,
    initialBudgetItems: z.array(BudgetItemSchema.omit({ id: true })).optional(),
    initialMilestones: z.array(TimelineMilestoneSchema.omit({ id: true })).optional(),
  })
  .strict();

export const AddBudgetItemRequestSchema = BudgetItemSchema.omit({ id: true });
export const AddMilestoneRequestSchema = TimelineMilestoneSchema.omit({ id: true });
export const AddVendorRequestSchema = VendorChecklistSchema.omit({ id: true });

export const GenerateThemeRequestSchema = z
  .object({
    eventPlanId: safeText(1, 64),
    preferences: safeText(0, 300).optional(),
  })
  .strict();

// Infer TypeScript types from schemas
export type EventInput = z.infer<typeof EventSchema>;
export type BudgetItemInput = z.infer<typeof BudgetItemSchema>;
export type TimelineMilestoneInput = z.infer<typeof TimelineMilestoneSchema>;
export type VendorChecklistInput = z.infer<typeof VendorChecklistSchema>;
export type ThemeIdeaInput = z.infer<typeof ThemeIdeaSchema>;
export type EventPlanInput = z.infer<typeof EventPlanSchema>;
export type CreateEventPlanRequest = z.infer<typeof CreateEventPlanRequestSchema>;
export type AddBudgetItemRequest = z.infer<typeof AddBudgetItemRequestSchema>;
export type AddMilestoneRequest = z.infer<typeof AddMilestoneRequestSchema>;
export type AddVendorRequest = z.infer<typeof AddVendorRequestSchema>;
export type GenerateThemeRequest = z.infer<typeof GenerateThemeRequestSchema>;
