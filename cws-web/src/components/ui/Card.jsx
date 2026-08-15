import { cn } from '@/lib/utils'
export default function Card({ className, ...props }) {
    return <div className={cn('bg-card border border-line rounded-xl', className)} {...props} />
}