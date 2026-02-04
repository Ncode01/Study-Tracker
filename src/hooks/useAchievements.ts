import { useState, useEffect, useCallback } from 'react';
import { ACHIEVEMENTS, type Achievement, type UserAchievement } from '../types/achievements';

interface AchievementState {
    unlocked: UserAchievement[];
    totalTasksCompleted: number;
    totalFocusSessions: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
}

const INITIAL_STATE: AchievementState = {
    unlocked: [],
    totalTasksCompleted: 0,
    totalFocusSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
};

export function useAchievements() {
    const [state, setState] = useState<AchievementState>(() => {
        const saved = localStorage.getItem('achievements_state');
        return saved ? JSON.parse(saved) : INITIAL_STATE;
    });

    const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);

    useEffect(() => {
        localStorage.setItem('achievements_state', JSON.stringify(state));
    }, [state]);

    // Check and update streak
    useEffect(() => {
        const today = new Date().toDateString();
        if (state.lastActiveDate) {
            const last = new Date(state.lastActiveDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (last.toDateString() !== today && last.toDateString() !== yesterday.toDateString()) {
                // Streak broken
                setState(prev => ({ ...prev, currentStreak: 0, lastActiveDate: today }));
            }
        }
    }, [state.lastActiveDate]);

    const checkAchievements = useCallback((xp: number) => {
        const newUnlocks: Achievement[] = [];

        ACHIEVEMENTS.forEach(achievement => {
            const alreadyUnlocked = state.unlocked.some(u => u.achievementId === achievement.id);
            if (alreadyUnlocked) return;

            let progress = 0;
            switch (achievement.category) {
                case 'xp':
                    progress = xp;
                    break;
                case 'tasks':
                    progress = state.totalTasksCompleted;
                    break;
                case 'focus':
                    progress = state.totalFocusSessions;
                    break;
                case 'streak':
                    progress = state.currentStreak;
                    break;
            }

            if (progress >= achievement.requirement) {
                newUnlocks.push(achievement);
            }
        });

        if (newUnlocks.length > 0) {
            setState(prev => ({
                ...prev,
                unlocked: [
                    ...prev.unlocked,
                    ...newUnlocks.map(a => ({
                        achievementId: a.id,
                        unlockedAt: new Date().toISOString(),
                        progress: a.requirement,
                    })),
                ],
            }));

            // Show notification for first unlock
            setNewUnlock(newUnlocks[0]);
            setTimeout(() => setNewUnlock(null), 5000);
        }

        return newUnlocks;
    }, [state]);

    const recordTaskCompletion = useCallback(() => {
        const today = new Date().toDateString();
        setState(prev => {
            const isNewDay = prev.lastActiveDate !== today;
            return {
                ...prev,
                totalTasksCompleted: prev.totalTasksCompleted + 1,
                currentStreak: isNewDay ? prev.currentStreak + 1 : prev.currentStreak,
                longestStreak: Math.max(prev.longestStreak, isNewDay ? prev.currentStreak + 1 : prev.currentStreak),
                lastActiveDate: today,
            };
        });
    }, []);

    const recordFocusSession = useCallback(() => {
        const today = new Date().toDateString();
        setState(prev => {
            const isNewDay = prev.lastActiveDate !== today;
            return {
                ...prev,
                totalFocusSessions: prev.totalFocusSessions + 1,
                currentStreak: isNewDay ? prev.currentStreak + 1 : prev.currentStreak,
                longestStreak: Math.max(prev.longestStreak, isNewDay ? prev.currentStreak + 1 : prev.currentStreak),
                lastActiveDate: today,
            };
        });
    }, []);

    const getProgress = useCallback((achievement: Achievement, xp: number): number => {
        switch (achievement.category) {
            case 'xp':
                return Math.min(100, (xp / achievement.requirement) * 100);
            case 'tasks':
                return Math.min(100, (state.totalTasksCompleted / achievement.requirement) * 100);
            case 'focus':
                return Math.min(100, (state.totalFocusSessions / achievement.requirement) * 100);
            case 'streak':
                return Math.min(100, (state.currentStreak / achievement.requirement) * 100);
            default:
                return 0;
        }
    }, [state]);

    const isUnlocked = useCallback((achievementId: string): boolean => {
        return state.unlocked.some(u => u.achievementId === achievementId);
    }, [state.unlocked]);

    return {
        achievements: ACHIEVEMENTS,
        unlocked: state.unlocked,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        totalTasksCompleted: state.totalTasksCompleted,
        totalFocusSessions: state.totalFocusSessions,
        newUnlock,
        checkAchievements,
        recordTaskCompletion,
        recordFocusSession,
        getProgress,
        isUnlocked,
    };
}
