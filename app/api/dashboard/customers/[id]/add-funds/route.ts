import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id: bankAccountId } = context.params;
    const { amount } = await request.json();

    const numericAmount = Number(amount);
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Fetch bank account with user
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
      include: { user: true },
    });

    if (!bankAccount) {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: 404 }
      );
    }

    const userId = bankAccount.userId;

    // Perform all updates in a transaction
    const [updatedBankAccount, updatedUser] = await prisma.$transaction([
      prisma.bankAccount.update({
        where: { id: bankAccountId },
        data: {
          balance: { increment: numericAmount },
          availableBalance: { increment: numericAmount },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          totalBalance: { increment: numericAmount },
        },
      }),
    ]);

    // Log the transaction
    await prisma.transaction.create({
      data: {
        userId,
        bankAccountId,
        type: "DEPOSIT",
        amount: numericAmount,
        status: "COMPLETED",
        currencyType: bankAccount.currencyType,
        description: `Admin added $${numericAmount} to account ${bankAccount.accountNumber}`,
        adminApprovalStatus: "APPROVED",
        completionDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Funds added to bank account`,
      bankAccount: {
        id: updatedBankAccount.id,
        balance: updatedBankAccount.balance,
      },
      user: {
        id: updatedUser.id,
        totalBalance: updatedUser.totalBalance,
        name: `${updatedUser.firstName ?? ""} ${updatedUser.lastName ?? ""}`,
      },
    });
  } catch (error: any) {
    console.error("Add funds API error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
