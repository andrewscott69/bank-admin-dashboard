import { NextRequest, NextResponse } from 'next/server'
import { validateAdminSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }

    const admin = await validateAdminSession(sessionToken)

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt,
      },
    })
  } catch (error) {
    console.error('Session validation error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
