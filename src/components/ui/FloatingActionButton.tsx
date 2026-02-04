import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FABAction {
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: string;
}

interface FloatingActionButtonProps {
    actions: FABAction[];
    position?: 'bottom-right' | 'bottom-left';
}

export function FloatingActionButton({
    actions,
    position = 'bottom-right'
}: FloatingActionButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
    };

    return (
        <div className={cn("fixed z-50", positionClasses[position])}>
            {/* Action buttons */}
            <AnimatePresence>
                {isOpen && (
                    <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 items-end">
                        {actions.map((action, index) => (
                            <motion.div
                                key={action.id}
                                initial={{ opacity: 0, scale: 0, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    transition: { delay: index * 0.05 }
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0,
                                    y: 20,
                                    transition: { delay: (actions.length - index) * 0.05 }
                                }}
                                className="flex items-center gap-3"
                            >
                                <span className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-sm whitespace-nowrap shadow-lg">
                                    {action.label}
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                        action.onClick();
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors",
                                        action.color || "bg-violet-600 hover:bg-violet-500 text-white"
                                    )}
                                >
                                    {action.icon}
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Main FAB */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-xl shadow-violet-500/30 flex items-center justify-center"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isOpen ? <X size={24} /> : <Plus size={24} />}
                </motion.div>
            </motion.button>
        </div>
    );
}
