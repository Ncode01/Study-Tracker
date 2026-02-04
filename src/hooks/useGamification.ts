import { useState, useEffect } from 'react';

const XP_PER_LEVEL_BASE = 100;

interface GamificationState {
    xp: number;
    level: number;
    streak: number;
    lastLoginDate: string | null;
}

const INITIAL_STATE: GamificationState = {
    xp: 0,
    level: 1,
    streak: 0,
    lastLoginDate: null,
};

export function useGamification() {
    const [state, setState] = useState<GamificationState>(() => {
        const saved = localStorage.getItem('gamification_state');
        return saved ? JSON.parse(saved) : INITIAL_STATE;
    });

    useEffect(() => {
        localStorage.setItem('gamification_state', JSON.stringify(state));
    }, [state]);

    const addXP = (amount: number) => {
        setState((prev) => {
            let newXP = prev.xp + amount;
            let newLevel = prev.level;

            // Simple leveling formula: Level = 1 + floor(sqrt(XP / 100))
            // Or iterative: XP needed for next level increases
            const xpForNextLevel = newLevel * XP_PER_LEVEL_BASE;

            if (newXP >= xpForNextLevel) {
                newLevel++;
                newXP -= xpForNextLevel; // Carry over XP or keep total? keeping total is easier usually but let's do resets for visual bar
                // Let's stick to Total XP for calculation simplicity, but visual bar needs "current level progress".
                // Actually, easier: Keep Total XP. Calculate Level from Total XP.
                // Level = floor(sqrt(totalXP / 100)) + 1 ?
                // Let's stick to the implementation plan's formula or a simple one.
                // Plan said: Level = floor(sqrt(XP / 100))

                // Let's recalculate level based on new Total
                // But for notification purposes we need to know if it changed.
            }

            // Let's try a simple cumulative threshold for now
            // Level 1: 0-100
            // Level 2: 101-300 (200 gap)
            // Level 3: 301-600 (300 gap)
            // Standard RPG curve

            // For now, let's just do a simple check
            if (newXP >= 100 * prev.level) {
                // Level Up logic could be complex, for now let's just increment if threshold met
                // But wait, if we subtract XP it's weird.
                // Let's store TOTAL XP and derive level.
            }

            return { ...prev, xp: prev.xp + amount };
        });
    };

    // Derived state
    const level = Math.floor(Math.sqrt(state.xp / 100)) + 1;
    const nextLevelXP = 100 * Math.pow(level, 2);
    const currentLevelBaseXP = 100 * Math.pow(level - 1, 2);
    const progressToNextLevel = ((state.xp - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100;

    return {
        xp: state.xp,
        level,
        currentStreak: state.streak,
        progress: Math.min(100, Math.max(0, progressToNextLevel)),
        addXP,
    };
}
