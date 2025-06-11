import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    console.log("Add funds API called")

    const { id } = context.params
    console.log("Customer ID:", id)

    if (!id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const body = await request.json()
    console.log("Request body:", body)

    const { amount } = body

    
    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 })
    }

    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    console.log("Parsed amount:", numericAmount)

    
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalBalance: true,
      },
    })

    if (!currentUser) {
      console.log("User not found with ID:", id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Current user:", currentUser)
    console.log("Current balance:", currentUser.totalBalance)

    const newBalance = currentUser.totalBalance + numericAmount
    console.log("New balance will be:", newBalance)

    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        totalBalance: newBalance,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalBalance: true,
      },
    })

    console.log("Updated user:", updatedUser)

    
    try {
      const transaction = await prisma.transaction.create({
        data: {
          userId: id,
          type: "DEPOSIT",
          amount: numericAmount,
          status: "COMPLETED",
          description: `Admin added funds: $${numericAmount}`,
          adminApprovalStatus: "APPROVED",
          completionDate: new Date(),
          currencyType: "USD",
        },
      })
      console.log("Transaction created:", transaction.id)
    } catch (transactionError) {
      console.error("Failed to create transaction record:", transactionError)
      // Don't fail the whole operation if transaction logging fails
    }

    return NextResponse.json({
      success: true,
      message: "Funds added successfully",
      totalBalance: updatedUser.totalBalance,
      amountAdded: numericAmount,
      user: {
        id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        totalBalance: updatedUser.totalBalance,
      },
    })
  } catch (error) {
    console.error("Add funds API error:", error)

    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Database constraint violation" }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
