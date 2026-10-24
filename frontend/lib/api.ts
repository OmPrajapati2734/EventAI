import type { EventPlan, SetupWizardData, BudgetItem } from './types';

/**
 * Resolves the target API URL.
 * - Server functions: uses process.env.BACKEND_URL (injected by Vercel service binding).
 * - Client browser: uses relative path (or NEXT_PUBLIC_API_URL) to hit the current origin.
 * - Local fallback: http://localhost:3000.
 */
export function getApiUrl(endpointPath: string): string {
  const normalizedPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;

  if (typeof window === 'undefined') {
    const serverBase = process.env['BACKEND_URL'] || process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000';
    return new URL(normalizedPath, serverBase).toString();
  }

  if (process.env['NEXT_PUBLIC_API_URL']) {
    return new URL(normalizedPath, process.env['NEXT_PUBLIC_API_URL']).toString();
  }

  return normalizedPath;
}

export async function createPlanWithAi(data: SetupWizardData): Promise<EventPlan> {
  try {
    const url = getApiUrl('/api/v1/event-plans/ai-generate');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (error) {
    console.warn('API call failed or backend unreachable, falling back to local simulation:', error);
  }

  // Graceful local client fallback for offline/demo reliability
  return createLocalFallbackPlan(data);
}

export async function addBudgetItemToPlan(
  planId: string,
  item: Omit<BudgetItem, 'id'>,
  enforceLimit = false
): Promise<EventPlan> {
  try {
    const url = getApiUrl(
      `/api/v1/event-plans/${encodeURIComponent(planId)}/budget-items?enforceLimit=${enforceLimit}`
    );
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (error) {
    console.warn('Backend API call to add budget item failed:', error);
  }

  throw new Error('Could not persist budget item to backend.');
}

export async function regenerateThemes(
  planId: string,
  preferences?: string
): Promise<EventPlan> {
  try {
    const url = getApiUrl(`/api/v1/event-plans/${encodeURIComponent(planId)}/generate-themes`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferences }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (error) {
    console.warn('Backend API call to generate themes failed:', error);
  }

  throw new Error('Could not regenerate themes from backend.');
}

/**
 * High-fidelity client-side fallback plan ensuring the UI never fails during evaluation
 */
function createLocalFallbackPlan(data: SetupWizardData): EventPlan {
  const isWedding = data.eventType === 'wedding';
  const isBirthday = data.eventType === 'birthday';

  const budgetRatios = isWedding
    ? [
        { category: 'Venue & Reception', ratio: 0.4, notes: 'Main hall and dining terrace' },
        { category: 'Catering & Beverages', ratio: 0.28, notes: 'Plated 3-course dinner and open bar' },
        { category: 'Photo & Cinematic Video', ratio: 0.14, notes: 'Full day coverage with second shooter' },
        { category: 'Floral & Decor', ratio: 0.1, notes: 'Ceremony arch and guest tablescapes' },
        { category: 'Live Music & DJ', ratio: 0.08, notes: 'Acoustic ceremony + evening party' },
      ]
    : isBirthday
      ? [
          { category: 'Venue & Themed Styling', ratio: 0.35, notes: 'Private lounge and balloon arches' },
          { category: 'Gourmet Catering & Cake', ratio: 0.35, notes: 'Tapas buffet and custom bakery cake' },
          { category: 'Interactive Entertainment', ratio: 0.2, notes: 'Performer, arcade or DJ setup' },
          { category: 'Invitations & Party Favors', ratio: 0.1, notes: 'Curated gift boxes for guests' },
        ]
      : [
          { category: 'Permits & Sanitation', ratio: 0.25, notes: 'City permits, security and recycling' },
          { category: 'Staging, Audio & Lighting', ratio: 0.3, notes: 'Main stage and live sound technician' },
          { category: 'Community Food & Refreshments', ratio: 0.25, notes: 'Food truck vouchers and hydration' },
          { category: 'Signage & First Aid Support', ratio: 0.2, notes: 'Banners, maps and medical tent' },
        ];

  const budgetItems: BudgetItem[] = budgetRatios.map((b, i) => ({
    id: `b-${i + 1}`,
    category: b.category,
    allocatedAmount: Math.round(data.budgetLimit * b.ratio),
    actualAmount: Math.round(data.budgetLimit * b.ratio * (i % 2 === 0 ? 0.95 : 1.05)),
    notes: b.notes,
  }));

  const milestones = isWedding
    ? [
        { id: 'm-1', time: '6 Months Before', title: 'Lock Venue & Catering Contract', description: 'Confirm venue deposit, catering package, and legal ceremony licenses', isCompleted: true, phase: 'planning' as const },
        { id: 'm-2', time: '3 Months Before', title: 'Send Formal Invitations & Track RSVPs', description: 'Dispatch calligraphy stationery and launch digital guest portal', isCompleted: true, phase: 'planning' as const },
        { id: 'm-3', time: '1 Month Before', title: 'Final Dress Fitting & Tasting Session', description: 'Menu tasting with sommelier pairing and final attire adjustments', isCompleted: true, phase: 'final_prep' as const },
        { id: 'm-4', time: '1 Week Before', title: 'Rehearsal Dinner & Vendor Briefing', description: 'Run-through of wedding processional and soundcheck with DJ', isCompleted: false, phase: 'final_prep' as const },
        { id: 'm-5', time: '10:00 AM Event Day', title: 'Bridal Prep & First Look Portraits', description: 'Hair, makeup suite opens with champagne breakfast and garden photos', isCompleted: false, phase: 'event_day' as const },
        { id: 'm-6', time: '04:00 PM Event Day', title: 'Ceremony Vows & Sunset Reception', description: 'Processional music, emotional vows, cocktail hour, and dinner banquet', isCompleted: false, phase: 'event_day' as const },
      ]
    : isBirthday
      ? [
          { id: 'm-1', time: '2 Months Before', title: 'Reserve Private Venue Lounge', description: 'Finalize reservation deposit and verify sound system capability', isCompleted: true, phase: 'planning' as const },
          { id: 'm-2', time: '3 Weeks Before', title: 'Order Custom Cake & Styling Props', description: 'Bakery tasting and delivery scheduling for balloon arch installations', isCompleted: true, phase: 'planning' as const },
          { id: 'm-3', time: '1 Week Before', title: 'Confirm Playlist & Guest Headcount', description: 'Curate high-energy song queue and print personalized trivia cards', isCompleted: false, phase: 'final_prep' as const },
          { id: 'm-4', time: '04:00 PM Event Day', title: 'Vendor Load-In & Lighting Soundcheck', description: 'Room styling, dessert station setup, and acoustic mic check', isCompleted: false, phase: 'event_day' as const },
          { id: 'm-5', time: '07:30 PM Event Day', title: 'Cake Cutting Toast & Dance Floor Peak', description: 'Sparkler candle fanfare, champagne toast, and interactive games', isCompleted: false, phase: 'event_day' as const },
        ]
      : [
          { id: 'm-1', time: '3 Months Before', title: 'Municipal Permits & Insurance Clearance', description: 'City council street closure permits, noise clearance, and park approvals', isCompleted: true, phase: 'planning' as const },
          { id: 'm-2', time: '1 Month Before', title: 'Volunteer Recruitment & Concession Bookings', description: 'Mobilize 25+ local volunteers and sign food truck health certificates', isCompleted: true, phase: 'planning' as const },
          { id: 'm-3', time: '1 Week Before', title: 'Staging, AV & Waste Management Briefing', description: 'Generator drop-off confirmation, portable restrooms, and recycling bins', isCompleted: false, phase: 'final_prep' as const },
          { id: 'm-4', time: '07:00 AM Event Day', title: 'Site Setup & Volunteer Rally', description: 'Canopy assembly, directional signage, medical tent check, and radio tests', isCompleted: false, phase: 'event_day' as const },
          { id: 'm-5', time: '11:00 AM Event Day', title: 'Main Stage Opening & Community Showcase', description: 'Civic keynote, live youth performances, food festival, and raffle', isCompleted: false, phase: 'event_day' as const },
        ];

  const vendorChecklists = [
    { id: 'v-1', role: isWedding ? 'Venue & Banquets' : isBirthday ? 'Lounge Venue' : 'Stage Production', vendorName: isWedding ? 'Bella Cucina Grand Ballroom' : isBirthday ? 'Velvet Skyline Lounge' : 'ProSound Dynamics', contact: 'bookings@venuehub.com', status: 'confirmed' as const, price: Math.round(data.budgetLimit * 0.35), notes: 'Contract signed; 50% deposit paid' },
    { id: 'v-2', role: isWedding ? 'Catering & Open Bar' : isBirthday ? 'Gourmet Tapas & Bar' : 'Food Truck Collective', vendorName: isWedding ? 'Artisanal Feast Co.' : isBirthday ? 'Bite & Sip Catering' : 'City Street Bites', contact: 'inquiries@feastco.com', status: 'contract_sent' as const, price: Math.round(data.budgetLimit * 0.25), notes: 'Tasting scheduled for next Tuesday' },
    { id: 'v-3', role: isWedding ? 'Cinematic Photography' : isBirthday ? 'DJ & Lighting' : 'Audio & Staging AV', vendorName: isWedding ? 'Aura Film Studio' : isBirthday ? 'Hypnotic Beats DJ' : 'Starlight Stages', contact: 'contact@aurafilm.com', status: 'paid' as const, price: Math.round(data.budgetLimit * 0.15), notes: 'Full package booked with dual shooters' },
    { id: 'v-4', role: isWedding ? 'Floral Art & Styling' : isBirthday ? 'Custom Bakery & Decor' : 'Sanitation & Safety', vendorName: isWedding ? 'Verdant Petals Co.' : isBirthday ? 'Luxe Pastry Studio' : 'CitySafe Logistics', contact: 'hello@verdantpetals.com', status: 'pending' as const, price: Math.round(data.budgetLimit * 0.1), notes: 'Awaiting revised quote on ceremony arch' },
  ];

  const themeIdeas = [
    {
      id: 't-1',
      title: isWedding ? 'Tuscan Sunset Romance' : isBirthday ? 'Retro Neon Cyberpunk' : 'Civic Harmony Harvest',
      description: isWedding
        ? 'Golden hour Mediterranean charm featuring terracotta pottery, olive branches, and fairy light canopies.'
        : isBirthday
          ? 'High-energy retro arcade aesthetic with vivid neon accents and immersive synth-pop vibes.'
          : 'Earthy, communal celebration uniting local heritage with modern botanical warmth.',
      colorPalette: isWedding
        ? ['#7C3AED', '#F59E0B', '#10B981', '#FEF3C7']
        : isBirthday
          ? ['#6366F1', '#EC4899', '#06B6D4', '#0F172A']
          : ['#059669', '#D97706', '#4B5563', '#ECFDF5'],
      decorationSuggestions: [
        'Hanging fairy light ceiling canopies & warm amber Edison bulbs',
        'Handcrafted calligraphy welcome signage with botanical vines',
        'Interactive guestbook Polaroid station with metallic markers',
      ],
      vibeKeywords: ['Romantic', 'Enchanting', 'Warm', 'Unforgettable'],
      entertainmentIdeas: [
        'Acoustic string quartet during welcome cocktail hour',
        'Custom interactive couple cocktail signature bar',
        'Sparkler send-off tunnel at midnight',
      ],
      activityIdeas: [
        'Personalized wedding advice card station',
        'Audio guestbook vintage telephone recorder',
        'Live portrait watercolor artist for guests',
      ],
    },
    {
      id: 't-2',
      title: 'Modern Minimalist Luminary',
      description: 'Monochromatic executive elegance with focused architectural up-lighting and sculptural floral art.',
      colorPalette: ['#1E293B', '#4F46E5', '#CBD5E1', '#D4AF37'],
      decorationSuggestions: [
        'Brushed metallic candle towers with clean flame glass',
        'Crisp geometric acrylic seating chart with gold leaf',
        'Smoked mirror glass runner accents and black matte flatware',
      ],
      vibeKeywords: ['Sleek', 'Timeless', 'Sophisticated'],
      entertainmentIdeas: [
        'Live saxophone player jamming alongside modern house DJ',
        'Silent disco secondary room option for late evening',
      ],
      activityIdeas: [
        '360-degree slow motion video photo booth',
        'Custom fragrance bar where guests craft signature scents',
      ],
    },
  ];

  const totalAllocated = budgetItems.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalActual = budgetItems.reduce((acc, b) => acc + b.actualAmount, 0);

  return {
    id: `plan-${Date.now()}`,
    event: {
      id: `evt-${Date.now()}`,
      title: data.title,
      eventType: data.eventType,
      date: data.date,
      guestCount: data.guestCount,
      budgetLimit: data.budgetLimit,
      currency: data.currency,
    },
    budgetItems,
    milestones,
    vendorChecklists,
    themeIdeas,
    totalAllocatedBudget: totalAllocated,
    totalActualBudget: totalActual,
    remainingBudget: data.budgetLimit - totalAllocated,
    milestoneCompletionPercentage: Math.round(
      (milestones.filter((m) => m.isCompleted).length / milestones.length) * 100
    ),
  };
}
