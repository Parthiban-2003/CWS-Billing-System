import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
    const { id } = await params
    const b = await req.json()

    const c = await prisma.customer.update({
        where: { id },
        data: {
            name: b.name,
            phone: b.phone,
        },
    })

    return NextResponse.json(c)
}