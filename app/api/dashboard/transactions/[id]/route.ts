
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: { id: string } }) {
    try {
      const { id } = context.params;
      const body = await request.json();
      const { action } = body;
  
      if (action !== "approve") {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
  
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          status: "COMPLETED",
          adminApprovalStatus: "APPROVED",
          approvalDate: new Date(),
        },
      });
  
      await prisma.transactionAuditLog.create({
        data: {
          transactionId: id,
          action: "APPROVE",
          previousStatus: "PENDING",
          newStatus: "COMPLETED",
          notes: "Approved by admin",
        },
      });
  
      return NextResponse.json({
        message: `Transaction approved successfully`,
        transaction: updatedTransaction,
      });
    } catch (error) {
      console.error("Failed to update transaction status", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  
