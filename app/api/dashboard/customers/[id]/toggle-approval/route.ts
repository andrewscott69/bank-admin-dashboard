

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!bankAccount) {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: bankAccount.userId },
      select: { autoApprovedTransaction: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    
    const updatedUser = await prisma.user.update({
      where: { id: bankAccount.userId },
      data: {
        autoApprovedTransaction: !user.autoApprovedTransaction,
      },
    });

    return NextResponse.json({
      message: "Auto-approve transaction setting updated",
      autoApprovedTransaction: updatedUser.autoApprovedTransaction,
    });
  } catch (error) {
    console.error("Failed to toggle auto-approved transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
