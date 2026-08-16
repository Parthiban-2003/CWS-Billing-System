import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...i) => twMerge(clsx(i))
export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })