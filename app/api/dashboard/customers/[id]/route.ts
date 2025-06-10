import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
//import { BankAccountStatus } from "@prisma/client";

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