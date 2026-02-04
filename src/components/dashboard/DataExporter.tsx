import { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { GradientButton } from '../ui/GradientButton';
import { useNotifications } from '../../hooks';

export function DataExporter() {
    const [downloading, setDownloading] = useState(false);
    const { showNotification } = useNotifications();

    const handleExport = () => {
        setDownloading(true);
        try {
            // Gather all local storage data
            const data = {
                sessions: JSON.parse(localStorage.getItem('study_sessions') || '[]'),
                tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
                marks: JSON.parse(localStorage.getItem('marks') || '[]'),
                gamification: JSON.parse(localStorage.getItem('gamification_state') || '{}'),
                pomodoro: JSON.parse(localStorage.getItem('pomodoro_settings') || '{}'),
                flashcards: JSON.parse(localStorage.getItem('flashcards') || '[]'),
                exportDate: new Date().toISOString(),
            };

            // Create blob and download link
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `study-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showNotification(
                'Export Successful',
                'Your data has been successfully exported.'
            );
        } catch (error) {
            console.error('Export failed:', error);
            showNotification(
                'Export Failed',
                'Failed to export data.'
            );
        } finally {
            setTimeout(() => setDownloading(false), 1000);
        }
    };

    return (
        <GradientButton
            onClick={handleExport}
            variant="secondary"
            icon={downloading ? <Check size={18} /> : <Download size={18} />}
            disabled={downloading}
        >
            {downloading ? 'Exported!' : 'Export Data'}
        </GradientButton>
    );
}
