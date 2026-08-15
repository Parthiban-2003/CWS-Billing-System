import { cn } from '@/lib/utils'
export default function Input({ className, ...props }) {
    return (
        <input
            className={cn('w-full rounded-lg bg-bg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-primary transition', className)}
            {...props}
        />
    )
}