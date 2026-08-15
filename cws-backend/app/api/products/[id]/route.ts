import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/schemas/product'

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params
    const parsed = productSchema.safeParse(await req.json())
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }
    const product = await prisma.product.update({
        where: { id },
        data: parsed.data,
    })
    return NextResponse.json(product)
}