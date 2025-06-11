import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const body = await request.json()
    const { amount, bankAccountId } = body

    if (!amount || !bankAccountId) {
      return NextResponse.json({ error: "Amount and Bank Account ID are required" }, { status: 400 })
    }

    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
      include: { user: true },
    })

    if (!bankAccount) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 })
    }

    // Update the bank account balance
    const updatedBankAccount = await prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: {
        balance: bankAccount.balance + numericAmount,
        availableBalance: bankAccount.availableBalance + numericAmount,
      },
    })

    // Recalculate user's total balance from all bank accounts
    const userBankAccounts = await prisma.bankAccount.findMany({
      where: { userId: bankAccount.userId },
      select: { balance: true },
    })

    const totalBalance = userBankAccounts.reduce((sum, account) => sum + account.balance, 0)

    const updatedUser = await prisma.user.update({
      where: { id: bankAccount.userId },
      data: {
        totalBalance,
        updatedAt: new Date(),
      },
    })

    // Log transaction
    await prisma.transaction.create({
      data: {
        userId: bankAccount.userId,
        bankAccountId: bankAccount.id,
        type: "DEPOSIT",
        amount: numericAmount,
        status: "COMPLETED",
        description: `Admin added funds to bank account: $${numericAmount}`,
        adminApprovalStatus: "APPROVED",
        completionDate: new Date(),
        currencyType: "USD",
      },
    })

    return NextResponse.json({
      message: "Funds added successfully",
      user: {
        id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        totalBalance: updatedUser.totalBalance,
      },
      bankAccount: {
        id: updatedBankAccount.id,
        balance: updatedBankAccount.balance,
      },
    })
  } catch (error) {
    console.error("Add funds API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
