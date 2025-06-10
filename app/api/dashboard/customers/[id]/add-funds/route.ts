import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const body = await request.json()
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get current user to add to existing balance
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { totalBalance: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        totalBalance: currentUser.totalBalance + amount,
        updatedAt: new Date(),
      },
    })

    // Optional: Create a transaction record for audit trail
    await prisma.transaction.create({
      data: {
        userId: id,
        type: "DEPOSIT",
        amount: amount,
        status: "COMPLETED",
        description: "User deposited funds",
        adminApprovalStatus: "APPROVED",
        completionDate: new Date(),
      },
    })

    return NextResponse.json({
      message: "Funds added successfully",
      totalBalance: updatedUser.totalBalance,
      amountAdded: amount,
    })
  } catch (error) {
    console.error("Failed to add funds", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
