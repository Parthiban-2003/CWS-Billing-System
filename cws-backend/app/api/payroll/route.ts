import { NextResponse } from 'next/server'
import { getMonthlyPayroll } from '@modules/payroll'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7)

    try {
        const data = await getMonthlyPayroll(month)
        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}