import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createAdminSession } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    const admin = await prisma.admin.findUnique({
      where: { email: validatedData.email },
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(validatedData.password, admin.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const sessionToken = await createAdminSession(admin.id)

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    const response = NextResponse.json(
      {
        message: 'Login successful',
        admin: {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 200 }
    )

    response.cookies.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, 
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
