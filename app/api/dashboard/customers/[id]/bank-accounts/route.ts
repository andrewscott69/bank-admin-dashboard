import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const accounts = await prisma.bankAccount.findMany({
      where: { userId: params.id },
      select: {
        id: true,
        bankName: true,
        accountNumber: true,
        balance: true,
      },
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch bank accounts" }, { status: 500 })
  }
}
