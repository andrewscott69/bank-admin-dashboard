import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { amount, adminId, note } = await request.json();

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const account = await prisma.bankAccount.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        balance: true,
        currencyType: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
    }

    const newBalance = account.balance + numericAmount;
    const newAvailableBalance = newBalance - 1000; 

    const [updatedAccount, updatedUser, newTransaction] = await prisma.$transaction([
      
      prisma.bankAccount.update({
        where: { id },
        data: {
          balance: newBalance,
          availableBalance: newAvailableBalance,
        },
      }),

      
      prisma.user.update({
        where: { id: account.userId },
        data: {
          totalBalance: {
            increment: numericAmount,
          },
        },
      }),

      // Create deposit transaction record
      prisma.transaction.create({
        data: {
          userId: account.userId,
          bankAccountId: account.id,
          type: "DEPOSIT",
          amount: numericAmount,
          status: "COMPLETED",
          currencyType: account.currencyType,
          description: "Bank Deposit",
          adminId: adminId ?? null,
          adminNotes: note ?? "Bank Teller Deposits.",
          completionDate: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      message: "Funds added successfully",
      bankAccount: updatedAccount,
      customer: updatedUser,
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Error adding funds:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
