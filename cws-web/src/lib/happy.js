export function isHappyNow(start, end) {
    if (!start || !end) return false
    const now = new Date()
    const cur = now.getHours() * 60 + now.getMinutes()
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const s = sh * 60 + sm
    const e = eh * 60 + em
    return s <= e ? cur >= s && cur < e : cur >= s || cur < e
}