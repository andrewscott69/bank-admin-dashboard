import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(): string {
  return jwt.sign({ timestamp: Date.now() }, JWT_SECRET)
}

export async function createAdminSession(adminId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await prisma.adminSession.create({
    data: {
      adminId,
      token,
      expiresAt,
    },
  })

  return token
}

export async function validateAdminSession(token: string) {
  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { admin: true },
  })

  if (!session || !session.admin?.isActive) return null

  return session
}

export async function deleteAdminSession(token: string): Promise<void> {
  await prisma.adminSession.deleteMany({
    where: { token },
  })
}
