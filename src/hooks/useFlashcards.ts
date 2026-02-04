import { useState, useEffect, useCallback } from 'react';
import type { Subject } from '../types';

export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    subject: Subject;
    difficulty: 'easy' | 'medium' | 'hard';
    reviewCount: number;
    correctCount: number;
    nextReview: string;
    createdAt: string;
}

interface FlashcardState {
    cards: Flashcard[];
    lastStudied: string | null;
}

const INITIAL_STATE: FlashcardState = {
    cards: [],
    lastStudied: null,
};

// SM-2 Spaced Repetition Algorithm
function calculateNextReview(correct: boolean, reviewCount: number): Date {
    const now = new Date();
    let interval: number;

    if (!correct) {
        interval = 1; // Review tomorrow if wrong
    } else {
        // Exponential increase: 1, 2, 4, 7, 14, 30 days
        const baseIntervals = [1, 2, 4, 7, 14, 30];
        interval = baseIntervals[Math.min(reviewCount, baseIntervals.length - 1)];
    }

    now.setDate(now.getDate() + interval);
    return now;
}

export function useFlashcards() {
    const [state, setState] = useState<FlashcardState>(() => {
        const saved = localStorage.getItem('flashcards_state');
        return saved ? JSON.parse(saved) : INITIAL_STATE;
    });

    useEffect(() => {
        localStorage.setItem('flashcards_state', JSON.stringify(state));
    }, [state]);

    const addCard = useCallback((card: Omit<Flashcard, 'id' | 'reviewCount' | 'correctCount' | 'nextReview' | 'createdAt'>) => {
        const newCard: Flashcard = {
            ...card,
            id: Math.random().toString(36).substr(2, 9),
            reviewCount: 0,
            correctCount: 0,
            nextReview: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };

        setState(prev => ({
            ...prev,
            cards: [...prev.cards, newCard],
        }));

        return newCard;
    }, []);

    const deleteCard = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            cards: prev.cards.filter(c => c.id !== id),
        }));
    }, []);

    const reviewCard = useCallback((id: string, correct: boolean) => {
        setState(prev => ({
            ...prev,
            cards: prev.cards.map(card => {
                if (card.id !== id) return card;

                const newReviewCount = card.reviewCount + 1;
                return {
                    ...card,
                    reviewCount: newReviewCount,
                    correctCount: correct ? card.correctCount + 1 : card.correctCount,
                    nextReview: calculateNextReview(correct, newReviewCount).toISOString(),
                };
            }),
            lastStudied: new Date().toISOString(),
        }));
    }, []);

    const getDueCards = useCallback((subject?: Subject): Flashcard[] => {
        const now = new Date();
        return state.cards.filter(card => {
            const isDue = new Date(card.nextReview) <= now;
            const matchesSubject = !subject || card.subject === subject;
            return isDue && matchesSubject;
        });
    }, [state.cards]);

    const getCardsBySubject = useCallback((subject: Subject): Flashcard[] => {
        return state.cards.filter(card => card.subject === subject);
    }, [state.cards]);

    const getAccuracy = useCallback((id?: string): number => {
        if (id) {
            const card = state.cards.find(c => c.id === id);
            if (!card || card.reviewCount === 0) return 0;
            return Math.round((card.correctCount / card.reviewCount) * 100);
        }

        const totalReviews = state.cards.reduce((sum, c) => sum + c.reviewCount, 0);
        const totalCorrect = state.cards.reduce((sum, c) => sum + c.correctCount, 0);
        if (totalReviews === 0) return 0;
        return Math.round((totalCorrect / totalReviews) * 100);
    }, [state.cards]);

    return {
        cards: state.cards,
        addCard,
        deleteCard,
        reviewCard,
        getDueCards,
        getCardsBySubject,
        getAccuracy,
        totalCards: state.cards.length,
        dueCount: getDueCards().length,
    };
}
