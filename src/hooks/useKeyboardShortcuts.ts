import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
}

const shortcuts: ShortcutConfig[] = [];

export function useKeyboardShortcuts(customShortcuts?: ShortcutConfig[]) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const allShortcuts = [...shortcuts, ...(customShortcuts || [])];

        for (const shortcut of allShortcuts) {
            const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
            const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
            const shiftMatch = shortcut.shift ? e.shiftKey : true;
            const altMatch = shortcut.alt ? e.altKey : true;

            if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
                // Don't trigger if in an input field
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                    return;
                }

                e.preventDefault();
                shortcut.action();
                return;
            }
        }
    }, [customShortcuts]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

export function registerShortcut(config: ShortcutConfig) {
    shortcuts.push(config);
    return () => {
        const index = shortcuts.indexOf(config);
        if (index > -1) shortcuts.splice(index, 1);
    };
}

export function getShortcutsList(): Array<{ keys: string; description: string }> {
    return shortcuts.map(s => ({
        keys: `${s.ctrl ? 'Ctrl+' : ''}${s.shift ? 'Shift+' : ''}${s.alt ? 'Alt+' : ''}${s.key.toUpperCase()}`,
        description: s.description,
    }));
}

// Common shortcuts
export const COMMON_SHORTCUTS = {
    NEW_TASK: { key: 't', ctrl: true, description: 'New Task' },
    START_TIMER: { key: ' ', description: 'Start/Pause Timer' },
    SEARCH: { key: 'k', ctrl: true, description: 'Open Search' },
    TOGGLE_THEME: { key: 'd', ctrl: true, shift: true, description: 'Toggle Theme' },
};
