import crypto from 'node:crypto';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  SchemaType,
  type ResponseSchema,
} from '@google/generative-ai';

import type {
  IEventPlannerService,
  PlanGenerationRequest,
  PlanGenerationOptions,
} from '../../domain/services/IEventPlannerService.js';
import { Event } from '../../domain/entities/Event.js';
import { BudgetItem } from '../../domain/entities/BudgetItem.js';
import { TimelineMilestone } from '../../domain/entities/TimelineMilestone.js';
import { VendorChecklist, type VendorStatus } from '../../domain/entities/VendorChecklist.js';
import { ThemeIdea } from '../../domain/entities/ThemeIdea.js';
import { EventPlan } from '../../domain/entities/EventPlan.js';
import { ExternalServiceError, ValidationError } from '../../domain/errors/DomainErrors.js';
import { PromptSanitizer } from '../security/promptSanitizer.js';
import { PlanLruCache } from '../cache/PlanLruCache.js';
import { getEnv } from '../../config/env.js';

/**
 * Minimal interface abstraction allowing mock Gemini clients in unit test suites.
 */
export interface IGeminiClient {
  getGenerativeModel(params: any): {
    generateContent(request: any): Promise<{
      response: {
        text(): string;
      };
    }>;
  };
}

export interface GeminiServiceConfig {
  apiKey?: string;
  modelName?: string;
  timeoutMs?: number;
  cache?: PlanLruCache<EventPlan>;
  client?: IGeminiClient;
}

/**
 * Structured Output Response Schema for Google Gemini 1.5.
 * Strictly guarantees deterministic JSON matching Domain EventPlan structure.
 */
const EVENT_PLAN_RESPONSE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    budgetItems: {
      type: SchemaType.ARRAY,
      description: 'Itemized financial allocations proportional to the budget limit and guest count.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          category: {
            type: SchemaType.STRING,
            description: 'Budget category (e.g., Venue & Reception, Catering, Floral & Decor, Entertainment)',
          },
          allocatedAmount: {
            type: SchemaType.NUMBER,
            description: 'Allocated currency amount (must be positive number)',
          },
          notes: {
            type: SchemaType.STRING,
            description: 'Cost management rationale, guest ratio advice, or specific scope',
          },
        },
        required: ['category', 'allocatedAmount', 'notes'],
      },
    },
    milestones: {
      type: SchemaType.ARRAY,
      description: 'Chronologically ordered day-of-event schedule milestones from morning load-in to departure.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          time: {
            type: SchemaType.STRING,
            description: 'Time string (e.g., "10:00 AM", "02:30 PM")',
          },
          title: {
            type: SchemaType.STRING,
            description: 'Milestone event or activity title',
          },
          description: {
            type: SchemaType.STRING,
            description: 'Detailed instructions, responsibilities, and sequencing',
          },
        },
        required: ['time', 'title', 'description'],
      },
    },
    vendorChecklist: {
      type: SchemaType.ARRAY,
      description: 'Essential vendor procurement checklist matching the event archetype.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          role: {
            type: SchemaType.STRING,
            description: 'Vendor role (e.g., Florist, DJ, Caterer, Photographer, Lighting Technician)',
          },
          vendorName: {
            type: SchemaType.STRING,
            description: 'Recommended vendor profile or service archetype',
          },
          contact: {
            type: SchemaType.STRING,
            description: 'Booking inquiry template, contact guide, or email',
          },
          status: {
            type: SchemaType.STRING,
            description: 'Procurement status',
          },
          price: {
            type: SchemaType.NUMBER,
            description: 'Estimated procurement cost',
          },
        },
        required: ['role', 'vendorName', 'contact', 'status', 'price'],
      },
    },
    themeIdeas: {
      type: SchemaType.ARRAY,
      description: 'Culturally sensitive, personalized celebration aesthetic themes.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: {
            type: SchemaType.STRING,
            description: 'Creative, evocative theme title',
          },
          description: {
            type: SchemaType.STRING,
            description: 'Visual aesthetic concept and guest experience vision',
          },
          colorPalette: {
            type: SchemaType.ARRAY,
            description: 'Hex color codes or descriptive palette tokens',
            items: { type: SchemaType.STRING },
          },
          decorationSuggestions: {
            type: SchemaType.ARRAY,
            description: 'Concrete, tangible decorative elements and installations',
            items: { type: SchemaType.STRING },
          },
          vibeKeywords: {
            type: SchemaType.ARRAY,
            description: 'Emotional atmosphere keywords (e.g., Romantic, High-Energy, Communal)',
            items: { type: SchemaType.STRING },
          },
        },
        required: ['title', 'description', 'colorPalette', 'decorationSuggestions', 'vibeKeywords'],
      },
    },
  },
  required: ['budgetItems', 'milestones', 'vendorChecklist', 'themeIdeas'],
};

/**
 * System Instructions establishing the persona of an elite Senior Celebration Architect.
 */
const SYSTEM_INSTRUCTIONS = `
You are an elite, world-class Senior Celebration & Event Planning Architect with over 20 years of experience orchestrating luxury weddings, milestone birthdays, and major community gatherings.

Your core mission is to construct an end-to-end, mathematically sound, logistically sequenced, and emotionally memorable celebration plan.

Core Planning Principles:
1. Financial Engineering:
   - The total sum of all BudgetItem allocatedAmount entries MUST be realistic and fit within the specified budgetLimit.
   - For Weddings: Prioritize Venue/Reception (35-45%), Catering & Bar (25-30%), Photography/Video (12-15%), Decor & Floral (10%), Entertainment (8-10%), Attire/Stationery (5%).
   - For Birthdays: Balance Venue & Atmosphere (30-35%), Catering & Cake (30-35%), Entertainment & Games (20-25%), Favors & Miscellaneous (10%).
   - For Community Gatherings: Emphasize Permits, Sanitation & Safety (25-30%), Audio/Visual & Staging (25%), Refreshments & Concessions (25%), Marketing & Coordination (20%).
   - Calibrate costs reasonably against guestCount.

2. Chronological Timeline Sequencing:
   - Sequence milestones strictly by time of day from morning setup to venue teardown.
   - Include load-in, guest arrival, ceremonial peaks/activities, meal/cake service, high-energy entertainment, and teardown.

3. Vendor Procurement Checklist:
   - Identify indispensable vendors. Initial status must be 'pending'.
   - Prices must align proportionally with corresponding budget items.

4. Contextual & Cultural Themes:
   - Produce 2 to 3 distinct, creative theme concepts honoring user preferences and cultural background.
   - Provide concrete, tangible decoration suggestions (e.g., "Hanging wisteria chandeliers and reclaimed cedar dining tables" rather than generic "flowers").
   - Include valid hex codes or descriptive colors in the color palette.

Respond ONLY with valid JSON conforming to the provided response schema.
`;

/**
 * Core GenAI Event Planning Service powered by Google Gemini API.
 * Features:
 * - Structured Outputs via responseSchema
 * - Defensive Content Safety Settings
 * - Prompt Injection Sanitization
 * - In-Memory LRU + TTL Request Caching
 * - Concurrency & Timeout Abort Defense
 * - Zero-Downtime Deterministic Fallback
 * - Complete Dependency Injection for unit testing
 */
export class GeminiEventPlannerService implements IEventPlannerService {
  private readonly client: IGeminiClient;
  private readonly modelName: string;
  private readonly defaultTimeoutMs: number;
  private readonly cache: PlanLruCache<EventPlan>;

  constructor(config: GeminiServiceConfig = {}) {
    const env = getEnv();
    const apiKey = config.apiKey ?? env.GEMINI_API_KEY;
    this.modelName = config.modelName ?? env.GEMINI_MODEL;
    this.defaultTimeoutMs = config.timeoutMs ?? 15000;
    this.cache = config.cache ?? new PlanLruCache<EventPlan>({ maxEntries: 100, defaultTtlMs: 3600000 });

    if (config.client) {
      this.client = config.client;
    } else {
      this.client = new GoogleGenerativeAI(apiKey) as unknown as IGeminiClient;
    }
  }

  /**
   * Generates a complete EventPlan aggregate root.
   */
  public async generatePlan(
    request: PlanGenerationRequest,
    options: PlanGenerationOptions = {}
  ): Promise<EventPlan> {
    this.validateRequest(request);

    // 1. Check in-memory LRU cache
    const cacheKey = this.cache.generateKey(request);
    if (!options.skipCache) {
      const cachedPlan = this.cache.get(cacheKey);
      if (cachedPlan) {
        return cachedPlan;
      }
    }

    // 2. Sanitize user-provided fields against prompt injection
    const sanitizedTitle = PromptSanitizer.sanitize(request.title, 'Event Title', 120);
    const sanitizedPreferences = PromptSanitizer.sanitize(request.userPreferences, 'User Preferences', 500);
    const sanitizedCulture = PromptSanitizer.sanitize(request.culturalContext, 'Cultural Context', 300);

    // 3. Assemble guarded prompt
    const prompt = this.buildPrompt(request, sanitizedTitle, sanitizedPreferences, sanitizedCulture);

    // 4. Configure timeout signal
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // 5. Get model instance with defensive safety settings & structured response schema
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        systemInstruction: SYSTEM_INSTRUCTIONS,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: EVENT_PLAN_RESPONSE_SCHEMA,
          temperature: 0.4,
          maxOutputTokens: 8192,
        },
      });

      // 6. Execute generation with timeout / signal handling
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new ExternalServiceError('Gemini', `Request timed out after ${timeoutMs}ms.`));
          });
          if (options.signal) {
            options.signal.addEventListener('abort', () => {
              reject(new ExternalServiceError('Gemini', 'Client aborted generation request.'));
            });
          }
        }),
      ]);

      clearTimeout(timer);

      const responseText = result.response.text();
      if (!responseText || responseText.trim().length === 0) {
        throw new ExternalServiceError('Gemini', 'Model returned an empty response.');
      }

      // 7. Parse and hydrate into Domain Aggregate Root
      const rawPlan = JSON.parse(responseText);
      const plan = this.hydrateEventPlan(request, rawPlan);

      // 8. Cache result for subsequent identical requests
      this.cache.set(cacheKey, plan);

      return plan;
    } catch (error: any) {
      clearTimeout(timer);

      // Handle abort / timeout or API failures with graceful archetype fallback
      console.warn(`[GeminiEventPlannerService] AI generation encountered issue: ${error.message}. Engaging graceful fallback.`);
      
      const fallbackPlan = this.generateFallbackPlan(request);
      // Cache fallback with short TTL (5 minutes) to avoid repeated immediate failures
      this.cache.set(cacheKey, fallbackPlan, 5 * 60 * 1000);
      return fallbackPlan;
    }
  }

  /**
   * Generates tailored celebration theme concepts only.
   */
  public async generateThemes(
    request: PlanGenerationRequest,
    options: PlanGenerationOptions = {}
  ): Promise<ThemeIdea[]> {
    const plan = await this.generatePlan(request, options);
    return plan.themeIdeas;
  }

  /**
   * Cache inspection utility for diagnostics and testing.
   */
  public get cacheStats() {
    return this.cache.stats;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  private validateRequest(request: PlanGenerationRequest): void {
    if (!request.title || request.title.trim().length === 0) {
      throw new ValidationError('Event title is required.');
    }
    if (!['wedding', 'birthday', 'community'].includes(request.eventType)) {
      throw new ValidationError(`Unsupported event type "${request.eventType}".`);
    }
    if (typeof request.guestCount !== 'number' || request.guestCount <= 0) {
      throw new ValidationError('Guest count must be a positive number.');
    }
    if (typeof request.budgetLimit !== 'number' || request.budgetLimit < 0) {
      throw new ValidationError('Budget limit must be non-negative.');
    }
    if (!request.currency || request.currency.trim().length !== 3) {
      throw new ValidationError('Currency must be a 3-letter ISO code.');
    }
  }

  private buildPrompt(
    request: PlanGenerationRequest,
    title: string,
    preferences: string,
    culturalContext: string
  ): string {
    const dateStr = typeof request.date === 'string' ? request.date : request.date.toISOString();

    const sections = [
      `Plan a complete, world-class ${request.eventType.toUpperCase()} celebration:`,
      `- Event Title: "${title}"`,
      `- Event Date: ${dateStr}`,
      `- Expected Guests: ${request.guestCount} people`,
      `- Financial Budget Limit: ${request.budgetLimit} ${request.currency.toUpperCase()}`,
    ];

    if (culturalContext) {
      sections.push(
        PromptSanitizer.wrapInSafeDataBoundary('cultural_context', culturalContext)
      );
    }

    if (preferences) {
      sections.push(
        PromptSanitizer.wrapInSafeDataBoundary('user_preferences', preferences)
      );
    }

    sections.push(
      'Ensure the output is 100% valid JSON matching the specified responseSchema.'
    );

    return sections.join('\n\n');
  }

  private hydrateEventPlan(request: PlanGenerationRequest, raw: any): EventPlan {
    const eventId = crypto.randomUUID();
    const planId = crypto.randomUUID();

    const event = new Event({
      id: eventId,
      title: request.title.trim(),
      eventType: request.eventType,
      date: new Date(request.date),
      guestCount: request.guestCount,
      budgetLimit: request.budgetLimit,
      currency: request.currency,
    });

    const budgetItems = (raw.budgetItems || []).map(
      (b: any) =>
        new BudgetItem({
          id: crypto.randomUUID(),
          category: String(b.category || 'General'),
          allocatedAmount: Number(b.allocatedAmount) || 0,
          actualAmount: 0,
          notes: String(b.notes || ''),
        })
    );

    const milestones = (raw.milestones || []).map(
      (m: any) =>
        new TimelineMilestone({
          id: crypto.randomUUID(),
          time: String(m.time || '12:00 PM'),
          title: String(m.title || 'Milestone'),
          description: String(m.description || ''),
          isCompleted: false,
        })
    );

    const vendorChecklists = (raw.vendorChecklist || []).map(
      (v: any) =>
        new VendorChecklist({
          id: crypto.randomUUID(),
          role: String(v.role || 'Vendor'),
          vendorName: String(v.vendorName || 'TBD'),
          contact: String(v.contact || 'Inquire'),
          status: (['pending', 'contacted', 'booked', 'rejected', 'completed'].includes(v.status)
            ? v.status
            : 'pending') as VendorStatus,
          price: Number(v.price) || 0,
        })
    );

    const themeIdeas = (raw.themeIdeas || []).map(
      (t: any) =>
        new ThemeIdea({
          id: crypto.randomUUID(),
          title: String(t.title || 'Celebration Theme'),
          description: String(t.description || ''),
          colorPalette: Array.isArray(t.colorPalette) && t.colorPalette.length > 0 ? t.colorPalette : ['#FFFFFF', '#333333'],
          decorationSuggestions: Array.isArray(t.decorationSuggestions) && t.decorationSuggestions.length > 0 ? t.decorationSuggestions : ['Atmospheric lighting'],
          vibeKeywords: Array.isArray(t.vibeKeywords) && t.vibeKeywords.length > 0 ? t.vibeKeywords : ['Celebratory'],
        })
    );

    return new EventPlan({
      id: planId,
      event,
      budgetItems,
      milestones,
      vendorChecklists,
      themeIdeas,
    });
  }

  /**
   * High-reliability deterministic fallback generator.
   * Guarantees zero downtime during network timeouts or quota exhaustion.
   */
  private generateFallbackPlan(request: PlanGenerationRequest): EventPlan {
    const isWedding = request.eventType === 'wedding';
    const isBirthday = request.eventType === 'birthday';

    const event = new Event({
      id: crypto.randomUUID(),
      title: request.title,
      eventType: request.eventType,
      date: new Date(request.date),
      guestCount: request.guestCount,
      budgetLimit: request.budgetLimit,
      currency: request.currency,
    });

    const budgetRatios = isWedding
      ? [
          { category: 'Venue & Reception', ratio: 0.4, notes: 'Main hall & service staff' },
          { category: 'Catering & Open Bar', ratio: 0.3, notes: 'Multi-course dinner & cocktails' },
          { category: 'Photo & Cinema', ratio: 0.15, notes: 'Full-day documentary coverage' },
          { category: 'Floral & Decor', ratio: 0.1, notes: 'Ceremony arch & tablescapes' },
          { category: 'Entertainment & Music', ratio: 0.05, notes: 'DJ & sound equipment' },
        ]
      : isBirthday
        ? [
            { category: 'Venue Rental & Styling', ratio: 0.35, notes: 'Private event space & decor' },
            { category: 'Food, Drinks & Specialty Cake', ratio: 0.35, notes: 'Buffet & customized bakery' },
            { category: 'Interactive Entertainment', ratio: 0.2, notes: 'Live performer or arcade stations' },
            { category: 'Invitations & Favors', ratio: 0.1, notes: 'Personalized guest gifts' },
          ]
        : [
            { category: 'Permits & Sanitation', ratio: 0.25, notes: 'City permits & waste management' },
            { category: 'Staging, Sound & Lighting', ratio: 0.3, notes: 'Main stage & audio technician' },
            { category: 'Community Refreshments', ratio: 0.25, notes: 'Beverage stations & snacks' },
            { category: 'First Aid & Signage', ratio: 0.2, notes: 'Safety tents & directional signs' },
          ];

    const budgetItems = budgetRatios.map(
      (b) =>
        new BudgetItem({
          id: crypto.randomUUID(),
          category: b.category,
          allocatedAmount: Math.round(request.budgetLimit * b.ratio),
          actualAmount: 0,
          notes: b.notes,
        })
    );

    const milestoneTemplates = isWedding
      ? [
          { time: '11:00 AM', title: 'Bridal Party & Groom Prep', description: 'Hair, makeup, and attire prep' },
          { time: '02:30 PM', title: 'Ceremony Processional', description: 'Exchange of vows, rings, and marriage blessing' },
          { time: '04:00 PM', title: 'Cocktail Hour & Portraits', description: 'Passed hors d’oeuvres and golden hour photography' },
          { time: '06:30 PM', title: 'Grand Reception & Toasts', description: 'Three-course dinner, speeches, and first dance' },
          { time: '10:30 PM', title: 'Sparkler Send-off', description: 'Guests line up for celebratory couple farewell' },
        ]
      : isBirthday
        ? [
            { time: '03:00 PM', title: 'Venue Styling & Soundcheck', description: 'Balloon installations and playlist review' },
            { time: '04:30 PM', title: 'Guests Welcome & Signature Drinks', description: 'Arrival socializing and photo wall' },
            { time: '06:00 PM', title: 'Featured Activity / Performance', description: 'Group activity, trivia, or live entertainer' },
            { time: '07:30 PM', title: 'Birthday Cake & Candle Toast', description: 'Singing, cake cutting, and dessert service' },
          ]
        : [
            { time: '08:00 AM', title: 'Volunteer & Vendor Load-in', description: 'Staging, tables, and sound system assembly' },
            { time: '10:00 AM', title: 'Gates Open & Opening Ceremony', description: 'Community welcome speech and overview' },
            { time: '01:00 PM', title: 'Cultural Showcase & Food Fest', description: 'Live performances and community booths' },
            { time: '05:00 PM', title: 'Closing Remarks & Clean-up', description: 'Volunteer recognition and venue teardown' },
          ];

    const milestones = milestoneTemplates.map(
      (m) =>
        new TimelineMilestone({
          id: crypto.randomUUID(),
          time: m.time,
          title: m.title,
          description: m.description,
          isCompleted: false,
        })
    );

    const vendorChecklists = [
      new VendorChecklist({
        id: crypto.randomUUID(),
        role: isWedding ? 'Catering' : isBirthday ? 'Cake Bakery' : 'Audio/Visual Logistics',
        vendorName: isWedding ? 'Gourmet Banquet Co.' : isBirthday ? 'Sweet Artistry Patisserie' : 'Apex Sound & Staging',
        contact: 'inquire@vendorplatform.local',
        status: 'pending',
        price: Math.round(request.budgetLimit * 0.25),
      }),
      new VendorChecklist({
        id: crypto.randomUUID(),
        role: isWedding ? 'Photography' : isBirthday ? 'Entertainment' : 'Security & First Aid',
        vendorName: isWedding ? 'Lumina Visuals' : isBirthday ? 'Dynamic Events Pro' : 'Civic Safety Corp',
        contact: 'booking@vendorplatform.local',
        status: 'pending',
        price: Math.round(request.budgetLimit * 0.15),
      }),
    ];

    const themeIdeas = [
      new ThemeIdea({
        id: crypto.randomUUID(),
        title: isWedding ? 'Timeless Celestial Romance' : isBirthday ? 'Electric Neon Twilight' : 'Urban Unity Harvest',
        description: `Bespoke celebration design customized for ${request.title}.`,
        colorPalette: isWedding ? ['#FFFFFF', '#D4AF37', '#2C3E50'] : isBirthday ? ['#FF007F', '#00F5FF', '#1E1B4B'] : ['#2D6A4F', '#D8F3DC', '#F4A261'],
        decorationSuggestions: ['Atmospheric warm lighting', 'Statement welcome signage', 'Themed table floral runners'],
        vibeKeywords: ['Elegant', 'Memorable', 'Seamless'],
      }),
    ];

    return new EventPlan({
      id: crypto.randomUUID(),
      event,
      budgetItems,
      milestones,
      vendorChecklists,
      themeIdeas,
    });
  }
}
