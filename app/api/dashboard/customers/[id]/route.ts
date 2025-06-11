// app/api/dashboard/customers/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH - Approve or Suspend a bank account
export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const { action } = body;

    if (!["approve", "suspend"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "ACTIVE" : "SUSPENDED";

    const updatedAccount = await prisma.bankAccount.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({
      message: `Account ${action}d successfully`,
      account: updatedAccount,
    });
  } catch (error) {
    console.error("Failed to update account status", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Delete a bank account
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    await prisma.bankAccount.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Failed to delete account", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET - Fetch a specific bank account by its ID
export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;

    // Fetch the bank account using the provided ID
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
      select: {
        id: true,
        accountName: true,
        accountType: true,
        balance: true,
        status: true,
        lastActivityAt: true,
        openedAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    // If the bank account does not exist, return a 404 error
    if (!bankAccount) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
    }

    // Format the response
    const accountDetails = {
      id: bankAccount.id,
      accountName: bankAccount.accountName,
      accountType: bankAccount.accountType,
      balance: bankAccount.balance,
      status: bankAccount.status,
      lastActivity: bankAccount.lastActivityAt?.toISOString().split("T")[0] ?? "N/A",
      openedAt: bankAccount.openedAt.toISOString().split("T")[0],
      user: {
        name: `${bankAccount.user.firstName} ${bankAccount.user.lastName}`,
        email: bankAccount.user.email,
        phone: bankAccount.user.phoneNumber,
      },
    };

    return NextResponse.json({ bankAccount: accountDetails });

  } catch (error) {
    console.error("Failed to fetch bank account", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
