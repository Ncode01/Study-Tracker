import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod'; // Assuming zod is installed as per previous files
import { SUBJECTS, type Subject } from '../../types';
import { GradientButton } from '../ui/GradientButton';
import { GlowInput } from '../ui/GlowInput';

const schema = z.object({
    question: z.string().min(3, 'Question is required'),
    answer: z.string().min(1, 'Answer is required'),
    subject: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
});

type FormData = z.infer<typeof schema>;

interface FlashcardFormProps {
    onSubmit: (data: FormData & { subject: Subject }) => void;
    onCancel: () => void;
}

export function FlashcardForm({ onSubmit, onCancel }: FlashcardFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            difficulty: 'medium',
            subject: SUBJECTS[0],
        }
    });

    return (
        <form onSubmit={handleSubmit((data) => onSubmit({ ...data, subject: data.subject as Subject }))} className="space-y-4">
            <GlowInput
                label="Question"
                {...register('question')}
                error={errors.question?.message}
                placeholder="e.g., What is the powerhouse of the cell?"
            />

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Answer</label>
                <textarea
                    {...register('answer')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all min-h-[100px]"
                    placeholder="The answer..."
                />
                {errors.answer && <p className="text-xs text-red-400">{errors.answer.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Subject</label>
                    <select
                        {...register('subject')}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50"
                    >
                        {SUBJECTS.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
                    <select
                        {...register('difficulty')}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                >
                    Cancel
                </button>
                <GradientButton type="submit" className="flex-1">
                    Create Card
                </GradientButton>
            </div>
        </form>
    );
}
