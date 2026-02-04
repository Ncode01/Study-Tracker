import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { getDailyQuote, getRandomQuote } from '../../data/quotes';

export function QuoteWidget() {
    const [quote, setQuote] = useState(getDailyQuote());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setQuote(getRandomQuote());
            setIsRefreshing(false);
        }, 300);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 p-6"
        >
            {/* Decorative quote marks */}
            <Quote className="absolute top-4 left-4 w-12 h-12 text-emerald-500/20 rotate-180" />
            <Quote className="absolute bottom-4 right-4 w-12 h-12 text-emerald-500/20" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Daily Motivation
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleRefresh}
                        className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                    >
                        <motion.div
                            animate={{ rotate: isRefreshing ? 360 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <RefreshCw size={16} />
                        </motion.div>
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={quote.text}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        <p className="text-lg font-medium text-white leading-relaxed">
                            "{quote.text}"
                        </p>
                        <p className="text-sm text-emerald-400 font-medium">
                            — {quote.author}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
