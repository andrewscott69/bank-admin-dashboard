import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to extract ID from the URL
function extractIdFromRequest(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split("/");
  return segments[segments.length - 1] || null;
}

// PATCH - Approve or Suspend a bank accoun
export async function PATCH(request: NextRequest) {
  try {
    const id = extractIdFromRequest(request);
    if (!id) {
      return NextResponse.json({ error: "Missing account ID" }, { status: 400 });
    }

    const { action } = await request.json();

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
export async function DELETE(request: NextRequest) {
  try {
    const id = extractIdFromRequest(request);
    if (!id) {
      return NextResponse.json({ error: "Missing account ID" }, { status: 400 });
    }

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
export async function GET(request: NextRequest) {
  try {
    const id = extractIdFromRequest(request);
    if (!id) {
      return NextResponse.json({ error: "Missing account ID" }, { status: 400 });
    }

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
      select: {
        id: true,
        accountName: true,
        accountNumber: true,
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

    if (!bankAccount) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
    }

    const accountDetails = {
      id: bankAccount.id,
      accountName: bankAccount.accountName,
      accountNumber: bankAccount.accountNumber,
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
