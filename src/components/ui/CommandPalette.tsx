import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    Timer,
    CheckSquare,
    BarChart2,
    Calendar,
    Trophy,
    Command,
    BookOpen
} from 'lucide-react';

interface CommandItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
    action: () => void;
    category: string;
}

interface CommandPaletteProps {
    onNavigate: (view: string) => void;
    onNewTask?: () => void;
    onStartTimer?: () => void;
}

export function CommandPalette({ onNavigate, onNewTask, onStartTimer }: CommandPaletteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const commands: CommandItem[] = [
        { id: 'dashboard', label: 'Go to Dashboard', icon: <BarChart2 size={18} />, shortcut: 'G D', action: () => onNavigate('dashboard'), category: 'Navigation' },
        { id: 'calendar', label: 'Go to Calendar', icon: <Calendar size={18} />, shortcut: 'G C', action: () => onNavigate('calendar'), category: 'Navigation' },
        { id: 'tasks', label: 'Go to Tasks', icon: <CheckSquare size={18} />, shortcut: 'G T', action: () => onNavigate('tasks'), category: 'Navigation' },
        { id: 'timer', label: 'Go to Timer', icon: <Timer size={18} />, shortcut: 'G F', action: () => onNavigate('timer'), category: 'Navigation' },
        { id: 'progress', label: 'Go to Progress', icon: <Trophy size={18} />, shortcut: 'G P', action: () => onNavigate('progress'), category: 'Navigation' },
        { id: 'flashcards', label: 'Go to Flashcards', icon: <BookOpen size={18} />, shortcut: 'G S', action: () => onNavigate('flashcards'), category: 'Navigation' },
        { id: 'new-task', label: 'Create New Task', icon: <Plus size={18} />, shortcut: '⌘N', action: () => { onNewTask?.(); setIsOpen(false); }, category: 'Actions' },
        { id: 'start-timer', label: 'Start Focus Timer', icon: <Timer size={18} />, shortcut: 'Space', action: () => { onStartTimer?.(); setIsOpen(false); }, category: 'Actions' },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
    );

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, CommandItem[]>);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(prev => !prev);
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleSelect = (cmd: CommandItem) => {
        cmd.action();
        setIsOpen(false);
        setSearch('');
    };

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setIsOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors text-sm"
            >
                <Command size={14} />
                <span>Quick Actions</span>
                <kbd className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-xs">⌘K</kbd>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                        />

                        {/* Palette */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[201]"
                        >
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                                {/* Search input */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                                    <Search size={20} className="text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search commands..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-white placeholder:text-muted-foreground"
                                        autoFocus
                                    />
                                </div>

                                {/* Commands */}
                                <div className="max-h-80 overflow-y-auto py-2">
                                    {Object.entries(groupedCommands).map(([category, items]) => (
                                        <div key={category}>
                                            <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                {category}
                                            </div>
                                            {items.map((cmd) => (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => handleSelect(cmd)}
                                                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-muted-foreground">{cmd.icon}</span>
                                                        <span className="text-white">{cmd.label}</span>
                                                    </div>
                                                    {cmd.shortcut && (
                                                        <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs text-muted-foreground">
                                                            {cmd.shortcut}
                                                        </kbd>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ))}

                                    {filteredCommands.length === 0 && (
                                        <div className="px-4 py-8 text-center text-muted-foreground">
                                            No commands found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
