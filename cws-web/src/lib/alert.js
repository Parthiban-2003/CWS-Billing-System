let ctx = null

export function playAlert() {
    try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
        const t = ctx.currentTime
            // 🔔 Two-tone ding-dong
            ;[880, 1174].forEach((f, i) => {
                const o = ctx.createOscillator()
                const g = ctx.createGain()
                o.connect(g)
                g.connect(ctx.destination)
                o.frequency.value = f
                g.gain.setValueAtTime(0.0001, t + i * 0.15)
                g.gain.exponentialRampToValueAtTime(0.25, t + i * 0.15 + 0.02)
                g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.15 + 0.4)
                o.start(t + i * 0.15)
                o.stop(t + i * 0.15 + 0.45)
            })
    } catch (e) {
        // audio blocked — silent
    }
}

export function browserNotify(title, body) {
    try {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body })
        }
    } catch (e) {
        // unsupported
    }
}