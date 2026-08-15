import { cn } from '@/lib/utils'

const variants = {
    primary: 'bg-primary text-bg hover:brightness-110 font-bold shadow-lg',
    soft: 'bg-primary-soft text-primary hover:brightness-110 font-bold',
    ghost: 'text-mut hover:text-ink hover:bg-primary-soft',
    danger: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold',
}

export default function Button({ variant = 'primary', className, ...props }) {
    return (
        <button
            className={cn('rounded-lg px-4 py-2.5 text-sm transition active:scale-95', variants[variant], className)}
            {...props}
        />
    )
}