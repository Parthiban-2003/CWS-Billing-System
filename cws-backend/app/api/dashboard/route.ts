import { NextResponse } from 'next/server'
import { getDashboard } from '@modules/dashboard'

export async function GET() {
  return NextResponse.json(await getDashboard())
}