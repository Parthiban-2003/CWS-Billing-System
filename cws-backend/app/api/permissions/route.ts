import { NextResponse } from 'next/server'
import { listPermissions } from '@modules/permissions'

export async function GET() {
    try {
        const data = await listPermissions()
        return NextResponse.json({ data })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}