
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            bankAccounts: true,
            cards: true,
          },
        },
        bankAccounts: {
          select: {
            id: true,
            accountName: true,
            accountNumber: true,
            balance: true,
            accountType: true,
          },
        },
        cards: {
          select: {
            id: true,
            name: true,
            cardNumber: true,
            type: true,
            network: true,
            isActive: true,
            balance: true,
          },
        },
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
