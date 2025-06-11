// app/api/dashboard/customers/[id]/add-funds.ts

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { amount, bankAccountId } = await request.json()

    if (!amount || !bankAccountId || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount or bank account" }, { status: 400 })
    }

    // Find the bank account and check if it belongs to the customer
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
      include: {
        user: true, // Ensure we get the associated user
      },
    })

    if (!bankAccount || bankAccount.user.id !== id) {
      return NextResponse.json({ error: "Bank account not found or does not belong to the customer" }, { status: 404 })
    }

    // Add funds to the bank account balance
    const updatedBankAccount = await prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: {
        balance: bankAccount.balance + amount,
      },
    })

    // Optionally, update customer's total balance in your customer model if needed
    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: {
        totalBalance: updatedCustomer.totalBalance + amount, // assuming the user has a totalBalance field
      },
    })

    return NextResponse.json({
      message: "Funds added successfully",
      bankAccount: updatedBankAccount,
      customer: updatedCustomer,
    })

  } catch (error) {
    console.error("Error adding funds:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
