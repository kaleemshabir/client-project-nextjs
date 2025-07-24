// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  try {
    await sendWelcomeEmail(email, name)
    return NextResponse.json({ status: 'success' })
  } catch (err) {
    return NextResponse.json({ status: 'error', error: err }, { status: 500 })
  }
}
