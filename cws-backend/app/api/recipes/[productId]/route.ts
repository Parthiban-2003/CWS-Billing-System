import { NextResponse } from 'next/server'
import { prisma } from '@/database/client'

const num = (v: unknown) => Number(v) || 0

export async function GET(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params
    const items = await prisma.recipeItem.findMany({
        where: { productId },
        include: { ingredient: true },
    })
    return NextResponse.json(items.map((i: any) => ({
        ...i,
        qty: Number(i.qty),
        ingredient: i.ingredient && { ...i.ingredient, stock: Number(i.ingredient.stock) },
    })))
}

export async function PUT(req: Request, { params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params
    const body = await req.json()
    const items = Array.isArray(body.items) ? body.items : []

    await prisma.$transaction([
        prisma.recipeItem.deleteMany({ where: { productId } }),
        prisma.recipeItem.createMany({
            data: items.map((i: any) => ({
                productId,
                ingredientId: i.ingredientId,
                qty: num(i.qty),
            })),
        }),
    ])

    return NextResponse.json({ ok: true, count: items.length })
}