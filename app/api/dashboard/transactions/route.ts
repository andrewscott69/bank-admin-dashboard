import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: true, 
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30, 
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
