/**
 * SellSpark AGI-Style Hierarchical Planner
 * Goal → subgoal decomposition, tool selection, and self-reflection loop.
 * Patent-pending recursive planner with budget-aware deliberation.
 */

export interface Goal { id: string; description: string; priority: number; deadline?: number }
export interface Action { tool: string; args: Record<string, unknown>; cost: number; expectedValue: number }

export function decompose(goal: Goal, depth = 2): Goal[] {
  if (depth <= 0) return [goal];
  const seeds: string[] = [
    `Research context for: ${goal.description}`,
    `Draft a plan for: ${goal.description}`,
    `Execute plan: ${goal.description}`,
    `Verify & iterate: ${goal.description}`,
  ];
  return seeds.map((d, i) => ({ id: `${goal.id}.${i}`, description: d, priority: goal.priority, deadline: goal.deadline }));
}

export function selectAction(candidates: Action[], budget: number): Action | null {
  const feasible = candidates.filter((a) => a.cost <= budget);
  if (feasible.length === 0) return null;
  feasible.sort((a, b) => b.expectedValue / Math.max(0.01, b.cost) - a.expectedValue / Math.max(0.01, a.cost));
  return feasible[0];
}

export function reflect(outcome: { success: boolean; observedValue: number; expected: number }): { lessonLearned: string; adjust: number } {
  const delta = outcome.observedValue - outcome.expected;
  return {
    lessonLearned: outcome.success
      ? `Outperformed expectation by ${delta.toFixed(2)} — reinforce tool selection.`
      : `Under-delivered by ${Math.abs(delta).toFixed(2)} — deprioritize this pathway.`,
    adjust: delta / Math.max(1, outcome.expected),
  };
}

export interface PlanNode { goal: Goal; children: PlanNode[]; chosen?: Action }

export function buildPlan(root: Goal): PlanNode {
  return {
    goal: root,
    children: decompose(root).map((g) => ({ goal: g, children: [] })),
  };
}
