import { NextRequest, NextResponse } from 'next/server'
import { validateAdminSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    const session = await validateAdminSession(sessionToken)

    if (!session || !session.admin) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const { id, firstName, lastName, email, role, lastLoginAt } = session.admin

    return NextResponse.json({
      admin: { id, firstName, lastName, email, role, lastLoginAt },
    })
  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
