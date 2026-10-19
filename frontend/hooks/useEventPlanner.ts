'use client';

import { useState, useCallback } from 'react';
import type { EventPlan, SetupWizardData, BudgetItem, VendorStatus } from '../lib/types';
import { createPlanWithAi, addBudgetItemToPlan, regenerateThemes } from '../lib/api';

export function useEventPlanner() {
  const [eventPlan, setEventPlan] = useState<EventPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingThemes, setIsRegeneratingThemes] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((msg: string) => {
    setAnnouncement(msg);
  }, []);

  const handleCreatePlan = async (data: SetupWizardData) => {
    setIsLoading(true);
    announce(`Initiating GenAI celebration orchestration for ${data.title}...`);
    try {
      const plan = await createPlanWithAi(data);
      setEventPlan(plan);
      announce(
        `Event masterplan generated successfully! Created ${plan.budgetItems.length} budget categories, ${plan.milestones.length} milestones, and ${plan.vendorChecklists.length} vendor tasks.`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Please try again.';
      announce(`Error generating event plan: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMilestone = useCallback((id: string) => {
    setEventPlan((prev) => {
      if (!prev) return null;
      const updatedMilestones = prev.milestones.map((m) =>
        m.id === id ? { ...m, isCompleted: !m.isCompleted } : m
      );
      const completedCount = updatedMilestones.filter((m) => m.isCompleted).length;
      const completionPercentage = Math.round(
        (completedCount / updatedMilestones.length) * 100
      );

      const target = updatedMilestones.find((m) => m.id === id);
      if (target) {
        announce(
          `Milestone "${target.title}" marked as ${target.isCompleted ? 'completed' : 'incomplete'}. Progress: ${completionPercentage}%.`
        );
      }

      return {
        ...prev,
        milestones: updatedMilestones,
        milestoneCompletionPercentage: completionPercentage,
      };
    });
  }, [announce]);

  const handleAddBudgetItem = useCallback(
    async (item: Omit<BudgetItem, 'id'>) => {
      if (!eventPlan) return;

      const optimisticItem: BudgetItem = {
        ...item,
        id: `b-${Date.now()}`,
      };

      setEventPlan((prev) => {
        if (!prev) return null;
        const newBudgetItems = [...prev.budgetItems, optimisticItem];
        const newTotalAllocated = newBudgetItems.reduce((sum, b) => sum + b.allocatedAmount, 0);
        const newTotalActual = newBudgetItems.reduce((sum, b) => sum + b.actualAmount, 0);

        return {
          ...prev,
          budgetItems: newBudgetItems,
          totalAllocatedBudget: newTotalAllocated,
          totalActualBudget: newTotalActual,
          remainingBudget: prev.event.budgetLimit - newTotalAllocated,
        };
      });

      announce(`Added budget item "${item.category}" for ${eventPlan.event.currency} ${item.allocatedAmount}.`);

      try {
        await addBudgetItemToPlan(eventPlan.id, item, false);
      } catch (err) {
        console.warn('Backend sync failed, maintaining optimistic client state:', err);
      }
    },
    [eventPlan, announce]
  );

  const handleUpdateVendorStatus = useCallback(
    (vendorId: string, status: VendorStatus) => {
      setEventPlan((prev) => {
        if (!prev) return null;
        const updated = prev.vendorChecklists.map((v) =>
          v.id === vendorId ? { ...v, status } : v
        );
        const vendor = updated.find((v) => v.id === vendorId);
        if (vendor) {
          announce(`Vendor "${vendor.vendorName}" status changed to ${status}.`);
        }
        return {
          ...prev,
          vendorChecklists: updated,
        };
      });
    },
    [announce]
  );

  const handleAddIdeaToPlan = useCallback(
    (ideaTitle: string, category: string = 'Decor & Ideas') => {
      if (!eventPlan) return;
      // Add as a new timeline milestone or budget task
      const newMilestoneId = `m-${Date.now()}`;
      setEventPlan((prev) => {
        if (!prev) return null;
        const newMilestones = [
          ...prev.milestones,
          {
            id: newMilestoneId,
            time: 'Custom Milestone',
            title: ideaTitle,
            description: `Concept added from AI recommendations (${category})`,
            isCompleted: false,
            phase: 'final_prep' as const,
          },
        ];
        return {
          ...prev,
          milestones: newMilestones,
        };
      });
      announce(`Added "${ideaTitle}" to your planning checklist.`);
    },
    [eventPlan, announce]
  );

  const handleRegenerateThemes = async (preferences?: string) => {
    if (!eventPlan) return;
    setIsRegeneratingThemes(true);
    announce('Regenerating creative theme concepts with Google Gemini AI...');
    try {
      const updatedPlan = await regenerateThemes(eventPlan.id, preferences);
      setEventPlan(updatedPlan);
      announce('Fresh AI theme inspirations loaded successfully.');
    } catch {
      // Rotate themes locally as fallback
      setEventPlan((prev) => {
        if (!prev) return null;
        const reversed = [...prev.themeIdeas].reverse();
        return { ...prev, themeIdeas: reversed };
      });
      announce('Themes refreshed.');
    } finally {
      setIsRegeneratingThemes(false);
    }
  };

  const resetPlan = () => {
    setEventPlan(null);
    announce('Resetting event planner to setup wizard.');
  };

  return {
    eventPlan,
    isLoading,
    isRegeneratingThemes,
    announcement,
    announce,
    createPlan: handleCreatePlan,
    toggleMilestone: handleToggleMilestone,
    addBudgetItem: handleAddBudgetItem,
    updateVendorStatus: handleUpdateVendorStatus,
    addIdeaToPlan: handleAddIdeaToPlan,
    regenerateThemes: handleRegenerateThemes,
    resetPlan,
  };
}
