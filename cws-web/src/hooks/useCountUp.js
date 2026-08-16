import { useEffect, useState } from 'react'

export function useCountUp(target, dur = 900) {
    const [val, setVal] = useState(0)
    useEffect(() => {
        let start = null
        const step = (ts) => {
            if (!start) start = ts
            const p = Math.min((ts - start) / dur, 1)
            setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
            if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [target, dur])
    return val
}