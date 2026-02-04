import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Flashcard } from '../../hooks/useFlashcards';
import { SUBJECT_COLORS } from '../../types';

interface FlashcardViewerProps {
    cards: Flashcard[];
    onCorrect: (id: string) => void;
    onIncorrect: (id: string) => void;
}

export function FlashcardViewer({ cards, onCorrect, onIncorrect }: FlashcardViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [completed, setCompleted] = useState<string[]>([]);

    if (cards.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No flashcards to review</p>
            </div>
        );
    }

    const currentCard = cards[currentIndex];
    const progress = ((completed.length) / cards.length) * 100;

    const handleAnswer = (correct: boolean) => {
        if (correct) {
            onCorrect(currentCard.id);
        } else {
            onIncorrect(currentCard.id);
        }

        setCompleted(prev => [...prev, currentCard.id]);
        setIsFlipped(false);

        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const goNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Card {currentIndex + 1} of {cards.length}</span>
                    <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Flashcard */}
            <div
                className="relative h-80 cursor-pointer perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <motion.div
                    className="absolute inset-0"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                >
                    {/* Front */}
                    <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 p-8 flex flex-col items-center justify-center backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div
                            className="w-3 h-3 rounded-full mb-4"
                            style={{ backgroundColor: SUBJECT_COLORS[currentCard.subject] }}
                        />
                        <p className="text-sm text-violet-400 font-medium mb-2">{currentCard.subject}</p>
                        <h3 className="text-2xl font-bold text-center">{currentCard.question}</h3>
                        <p className="text-sm text-muted-foreground mt-6">Click to reveal answer</p>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-8 flex flex-col items-center justify-center backface-hidden"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <p className="text-sm text-emerald-400 font-medium mb-2">Answer</p>
                        <h3 className="text-2xl font-bold text-center">{currentCard.answer}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAnswer(false)}
                    className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                >
                    <X size={24} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                    <RotateCcw size={20} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAnswer(true)}
                    className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                >
                    <Check size={24} />
                </motion.button>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                    Previous
                </button>
                <button
                    onClick={goNext}
                    disabled={currentIndex === cards.length - 1}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
