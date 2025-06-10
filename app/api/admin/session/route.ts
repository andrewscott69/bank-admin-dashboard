
import { NextRequest, NextResponse } from 'next/server'
import { validateAdminSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin-session')?.value

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  const session = await validateAdminSession(token)

  if (!session) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  return NextResponse.json({ valid: true, admin: session.admin })
}
