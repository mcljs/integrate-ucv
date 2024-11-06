import { clsx } from 'clsx';

export function Gradient({ className, ...props }) {
    return (
        <div
            {...props}
            className={clsx(
                className,
                'absolute inset-0',
                'bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))]',
                'from-[#F5A623] via-[#FFF6E5] to-[#FFFFFF]',
                'opacity-85'
            )}
        />
    );
}

export function GradientBackground() {
    return (
        <div className="relative mx-auto max-w-7xl">
            <div
                className={clsx(
                    'absolute -right-60 -top-44 h-72 w-[42rem] transform-gpu md:right-0',
                    'bg-[linear-gradient(145deg,var(--tw-gradient-stops))]',
                    'from-[#F5A623] from-[20%]',
                    'via-[#FDF1DC] via-[60%]',
                    'to-[#FFFFFF]',
                    'rotate-[-12deg] rounded-full blur-3xl opacity-60',
                )}
            />
        </div>
    )
}