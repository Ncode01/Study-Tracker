// Achievement System Types and Definitions

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'xp' | 'tasks' | 'focus' | 'streak' | 'special';
    requirement: number;
    xpReward: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
    achievementId: string;
    unlockedAt: string;
    progress: number;
}

export const ACHIEVEMENTS: Achievement[] = [
    // XP Milestones
    { id: 'xp_100', name: 'First Steps', description: 'Earn your first 100 XP', icon: '⭐', category: 'xp', requirement: 100, xpReward: 25, rarity: 'common' },
    { id: 'xp_500', name: 'Rising Scholar', description: 'Earn 500 XP', icon: '🌟', category: 'xp', requirement: 500, xpReward: 50, rarity: 'common' },
    { id: 'xp_1000', name: 'Knowledge Seeker', description: 'Earn 1,000 XP', icon: '💫', category: 'xp', requirement: 1000, xpReward: 100, rarity: 'rare' },
    { id: 'xp_5000', name: 'Wisdom Master', description: 'Earn 5,000 XP', icon: '✨', category: 'xp', requirement: 5000, xpReward: 250, rarity: 'epic' },
    { id: 'xp_10000', name: 'Legendary Scholar', description: 'Earn 10,000 XP', icon: '🏆', category: 'xp', requirement: 10000, xpReward: 500, rarity: 'legendary' },

    // Task Milestones
    { id: 'tasks_1', name: 'Task Beginner', description: 'Complete your first task', icon: '✅', category: 'tasks', requirement: 1, xpReward: 10, rarity: 'common' },
    { id: 'tasks_10', name: 'Task Warrior', description: 'Complete 10 tasks', icon: '🎯', category: 'tasks', requirement: 10, xpReward: 50, rarity: 'common' },
    { id: 'tasks_50', name: 'Task Champion', description: 'Complete 50 tasks', icon: '🏅', category: 'tasks', requirement: 50, xpReward: 150, rarity: 'rare' },
    { id: 'tasks_100', name: 'Task Legend', description: 'Complete 100 tasks', icon: '👑', category: 'tasks', requirement: 100, xpReward: 300, rarity: 'epic' },

    // Focus Session Milestones
    { id: 'focus_1', name: 'First Focus', description: 'Complete your first focus session', icon: '🧘', category: 'focus', requirement: 1, xpReward: 15, rarity: 'common' },
    { id: 'focus_10', name: 'Focus Apprentice', description: 'Complete 10 focus sessions', icon: '🔥', category: 'focus', requirement: 10, xpReward: 75, rarity: 'common' },
    { id: 'focus_50', name: 'Deep Focus', description: 'Complete 50 focus sessions', icon: '💪', category: 'focus', requirement: 50, xpReward: 200, rarity: 'rare' },
    { id: 'focus_100', name: 'Zen Master', description: 'Complete 100 focus sessions', icon: '🧠', category: 'focus', requirement: 100, xpReward: 400, rarity: 'epic' },

    // Streak Milestones
    { id: 'streak_3', name: 'Warming Up', description: 'Maintain a 3-day streak', icon: '🔥', category: 'streak', requirement: 3, xpReward: 30, rarity: 'common' },
    { id: 'streak_7', name: 'On Fire', description: 'Maintain a 7-day streak', icon: '🔥🔥', category: 'streak', requirement: 7, xpReward: 100, rarity: 'rare' },
    { id: 'streak_30', name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: '🌋', category: 'streak', requirement: 30, xpReward: 500, rarity: 'epic' },
    { id: 'streak_100', name: 'Eternal Flame', description: 'Maintain a 100-day streak', icon: '🌠', category: 'streak', requirement: 100, xpReward: 1000, rarity: 'legendary' },

    // Special Achievements
    { id: 'early_bird', name: 'Early Bird', description: 'Start studying before 7 AM', icon: '🌅', category: 'special', requirement: 1, xpReward: 50, rarity: 'rare' },
    { id: 'night_owl', name: 'Night Owl', description: 'Study past midnight', icon: '🦉', category: 'special', requirement: 1, xpReward: 50, rarity: 'rare' },
    { id: 'perfectionist', name: 'Perfectionist', description: 'Complete all daily quests in one day', icon: '💎', category: 'special', requirement: 1, xpReward: 75, rarity: 'epic' },
];

export const RARITY_COLORS = {
    common: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', border: 'border-zinc-500/30', glow: '' },
    rare: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
    epic: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/30' },
    legendary: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/40' },
};

export const TITLES = [
    { minLevel: 1, title: 'Novice', color: 'text-zinc-400' },
    { minLevel: 3, title: 'Apprentice', color: 'text-green-400' },
    { minLevel: 5, title: 'Scholar', color: 'text-blue-400' },
    { minLevel: 10, title: 'Expert', color: 'text-purple-400' },
    { minLevel: 15, title: 'Master', color: 'text-amber-400' },
    { minLevel: 20, title: 'Grandmaster', color: 'text-red-400' },
    { minLevel: 30, title: 'Legend', color: 'text-gradient-primary' },
];

export function getTitle(level: number): { title: string; color: string } {
    const applicable = TITLES.filter(t => level >= t.minLevel);
    return applicable[applicable.length - 1] || TITLES[0];
}
