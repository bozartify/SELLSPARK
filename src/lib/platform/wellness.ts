/**
 * SellSpark Creator Wellness Engine
 * Burnout risk scoring, Pomodoro/deep-work timers, circadian-aware
 * posting windows, and mindful-commerce "focus mode" blocking.
 */

export interface WorkSignals { hoursToday: number; hoursThisWeek: number; lateNightSessions: number; missedBreaks: number; hrvDrop: number }

export function burnoutRisk(s: WorkSignals): { score: number; level: 'low' | 'moderate' | 'high' | 'critical'; advice: string[] } {
  const score = Math.min(100,
    Math.min(30, s.hoursToday * 3) +
    Math.min(25, (s.hoursThisWeek - 40) * 1.5) +
    s.lateNightSessions * 5 +
    s.missedBreaks * 3 +
    s.hrvDrop * 2,
  );
  const level = score > 80 ? 'critical' : score > 55 ? 'high' : score > 30 ? 'moderate' : 'low';
  const advice: string[] = [];
  if (s.lateNightSessions > 2) advice.push('Set a hard shutdown at 10pm');
  if (s.missedBreaks > 3) advice.push('Enable Pomodoro 25/5 mode');
  if (s.hoursThisWeek > 55) advice.push('Delegate to the Agent swarm');
  if (score < 30) advice.push('You&apos;re in a sustainable zone — keep it up');
  return { score, level, advice };
}

export function optimalPostingWindow(tzOffsetMin: number): string[] {
  const base = [9, 12, 17, 20]; // local hours
  return base.map((h) => {
    const adj = (h + Math.round(tzOffsetMin / 60) + 24) % 24;
    return `${String(adj).padStart(2, '0')}:00`;
  });
}
