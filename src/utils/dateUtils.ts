import { format, subDays, isSameDay, parseISO, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Habit, HabitLog, FrequencyConfig } from '../types';

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDisplayDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEE, MMM d');
  } catch {
    return dateStr;
  }
}

export function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return '';
  const [hours, mins] = timeStr.split(':');
  const h = parseInt(hours, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${mins || '00'} ${ampm}`;
}

export function getPastNDays(daysCount: number = 365): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    dates.push(format(subDays(today, i), 'yyyy-MM-dd'));
  }
  return dates;
}

export function getWeekDates(baseDate: Date = new Date(), startOnMonday: boolean = true): Date[] {
  const start = startOfWeek(baseDate, { weekStartsOn: startOnMonday ? 1 : 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getMonthDays(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  return eachDayOfInterval({ start, end });
}

export function isHabitScheduledForDay(habit: Habit, dateStr: string): boolean {
  const date = parseISO(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  if (habit.frequency.type === 'daily') return true;
  if (habit.frequency.type === 'specific_days' && habit.frequency.days) {
    return habit.frequency.days.includes(dayOfWeek);
  }
  return true;
}

export function calculateHabitStats(habit: Habit, logs: HabitLog[]) {
  const habitLogs = logs.filter(l => l.habitId === habit.id);
  const completedDateSet = new Set(habitLogs.filter(l => l.completed).map(l => l.date));

  // Sort logs by date descending
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check from today backwards
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

  // If today is completed or yesterday is completed, start streak
  let checkDate = today;
  let isCurrentStreakAlive = false;

  if (completedDateSet.has(todayStr)) {
    isCurrentStreakAlive = true;
    checkDate = today;
  } else if (completedDateSet.has(yesterdayStr)) {
    isCurrentStreakAlive = true;
    checkDate = subDays(today, 1);
  }

  if (isCurrentStreakAlive) {
    let d = checkDate;
    while (true) {
      const dStr = format(d, 'yyyy-MM-dd');
      const isScheduled = isHabitScheduledForDay(habit, dStr);
      if (isScheduled) {
        if (completedDateSet.has(dStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
      d = subDays(d, 1);
      // Safety ceiling (e.g. 1000 days max)
      if (currentStreak > 1000) break;
    }
  }

  // Calculate longest streak across history
  const allScheduledDays = getPastNDays(365);
  tempStreak = 0;
  let scheduledCount = 0;
  let completedCount = 0;

  for (const dayStr of allScheduledDays) {
    const isScheduled = isHabitScheduledForDay(habit, dayStr);
    if (isScheduled) {
      scheduledCount++;
      if (completedDateSet.has(dayStr)) {
        completedCount++;
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  const completionRate = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;

  return {
    currentStreak,
    longestStreak,
    completionRate,
    totalCompleted: completedDateSet.size,
  };
}
