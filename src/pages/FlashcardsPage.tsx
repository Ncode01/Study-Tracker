import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Brain, BookOpen, X } from 'lucide-react';
import { useFlashcards } from '../hooks';
import { FlashcardViewer } from '../components/study';
import { FlashcardForm } from '../components/study/FlashcardForm'; // Need to create this
import { GradientButton } from '../components/ui/GradientButton';
import { StaggeredGrid } from '../components/ui/StaggeredList';
import { SUBJECT_COLORS, SUBJECTS, type Subject } from '../types';
import { cn } from '../lib/utils';
import { Card3D } from '../components/ui/Card3D';

function FlashcardsPage(): React.ReactElement {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');
    const { cards, addCard, deleteCard, reviewCard, getDueCards, getCardsBySubject, getAccuracy } = useFlashcards();

    const filteredCards = selectedSubject === 'all' ? cards : getCardsBySubject(selectedSubject);
    const dueCards = selectedSubject === 'all' ? getDueCards() : getDueCards(selectedSubject);

    const handleAddCard = (data: { question: string; answer: string; subject: Subject; difficulty: 'easy' | 'medium' | 'hard' }) => {
        addCard(data);
        setIsFormOpen(false);
    };

    const handleReviewComplete = (id: string, correct: boolean) => {
        reviewCard(id, correct);
    };

    if (reviewMode) {
        return (
            <div className="space-y-6 h-full flex flex-col">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setReviewMode(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X />
                    </button>
                    <h2 className="text-2xl font-bold">Review Session</h2>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <FlashcardViewer
                        cards={dueCards.length > 0 ? dueCards : filteredCards}
                        onCorrect={(id) => handleReviewComplete(id, true)}
                        onIncorrect={(id) => handleReviewComplete(id, false)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Flashcards
                    </h1>
                    <p className="text-muted-foreground">Master your subjects with spaced repetition</p>
                </div>
                <div className="flex gap-2">
                    <GradientButton
                        onClick={() => setReviewMode(true)}
                        variant="secondary"
                        disabled={filteredCards.length === 0}
                        icon={<Brain size={20} />}
                    >
                        Start Review ({dueCards.length} due)
                    </GradientButton>
                    <GradientButton onClick={() => setIsFormOpen(true)} icon={<Plus size={20} />}>
                        New Card
                    </GradientButton>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setSelectedSubject('all')}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                        selectedSubject === 'all'
                            ? "bg-primary text-white border-primary"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                >
                    All Subjects
                </button>
                {SUBJECTS.map(subject => (
                    <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors border whitespace-nowrap",
                            selectedSubject === subject
                                ? "bg-white/20 border-white/30"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                        style={selectedSubject === subject ? { backgroundColor: SUBJECT_COLORS[subject], borderColor: SUBJECT_COLORS[subject] } : {}}
                    >
                        {subject}
                    </button>
                ))}
            </div>

            <StaggeredGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCards.map(card => (
                    <Card3D key={card.id} className="h-full">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full flex flex-col justify-between group hover:border-white/20 transition-all">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span
                                        className="text-xs font-bold px-2 py-1 rounded-full text-white/90"
                                        style={{ backgroundColor: SUBJECT_COLORS[card.subject] }}
                                    >
                                        {card.subject}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                                        className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg line-clamp-3">{card.question}</h3>
                                <div className="pt-4 border-t border-white/5">
                                    <p className="text-sm text-muted-foreground line-clamp-2">{card.answer}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
                                <span>Difficulty: {card.difficulty}</span>
                                <span>Accuracy: {getAccuracy(card.id)}%</span>
                            </div>
                        </div>
                    </Card3D>
                ))}
                {filteredCards.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No flashcards found. Create one to get started!</p>
                    </div>
                )}
            </StaggeredGrid>

            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsFormOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">New Flashcard</h2>
                                <button onClick={() => setIsFormOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity">
                                    <Plus className="rotate-45" />
                                </button>
                            </div>
                            <FlashcardForm onSubmit={handleAddCard} onCancel={() => setIsFormOpen(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default FlashcardsPage;
