import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body;
    

    const originalTx = await prisma.transaction.findUnique({
      where: { id },
      include: { bankAccount: true, user: true },
    });

    if (!originalTx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (action === "edit") {
      const updated = await prisma.transaction.update({
        where: { id },
        data: {
          amount: body.amount ?? originalTx.amount,
          fee: body.fee ?? originalTx.fee,
          status: body.status ?? originalTx.status,
          currencyType: body.currencyType ?? originalTx.currencyType,
          description: body.description ?? originalTx.description,
          reference: body.reference ?? originalTx.reference,
          txHash: body.txHash ?? originalTx.txHash,
    
          fromAccount: body.fromAccount ?? originalTx.fromAccount,
          toAccount: body.toAccount ?? originalTx.toAccount,
          merchantName: body.merchantName ?? originalTx.merchantName,
          category: body.category ?? originalTx.category,
    
          // Recipient info
          recipientName: body.recipientName ?? originalTx.recipientName,
          recipientAccount: body.recipientAccount ?? originalTx.recipientAccount,
          recipientBank: body.recipientBank ?? originalTx.recipientBank,
          recipientBankAddress:
            body.recipientBankAddress ?? originalTx.recipientBankAddress,
          recipientCountry: body.recipientCountry ?? originalTx.recipientCountry,
          swiftCode: body.swiftCode ?? originalTx.swiftCode,
          routingNumber: body.routingNumber ?? originalTx.routingNumber,
          iban: body.iban ?? originalTx.iban,
          intermediaryBank: body.intermediaryBank ?? originalTx.intermediaryBank,
          transferType: body.transferType ?? originalTx.transferType,
          estimatedArrival: body.estimatedArrival ?? originalTx.estimatedArrival,
    
          // Relations (careful: must be valid UUIDs)
          bankAccountId: body.bankAccountId ?? originalTx.bankAccountId,
          cardId: body.cardId ?? originalTx.cardId,
    
          // Dates (ensure valid Date)
          createdAt: body.createdAt ? new Date(body.createdAt) : originalTx.createdAt,
          scheduledDate: body.scheduledDate
            ? new Date(body.scheduledDate)
            : originalTx.scheduledDate,
          completionDate: body.completionDate
            ? new Date(body.completionDate)
            : originalTx.completionDate,
        },
      });
    
      return NextResponse.json({
        message: "Transaction fully updated.",
        transaction: updated,
      });
    }
    


    const { bankAccountId, userId } = originalTx;
    const totalAmount = originalTx.amount + originalTx.fee;

    if (!bankAccountId || !userId) {
      return NextResponse.json(
        { error: "Transaction missing bankAccountId or userId" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id },
          data: {
            status: "COMPLETED",
            adminApprovalStatus: "APPROVED",
            approvalDate: new Date(),
            
          },
        }),
        // Optional: Add audit logging here if needed
      ]);

      return NextResponse.json({
        message: "Transaction approved and marked as completed.",
        transaction: { id, status: "COMPLETED" },
      });
    }

    if (action === "reject") {
      const refundTxId = `REFUND${Date.now()}${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      await prisma.$transaction([
        prisma.transaction.update({
          where: { id },
          data: {
            status: "FAILED",
            adminApprovalStatus: "REJECTED",
            approvalDate: new Date(),
           
          },
        }),

        prisma.transaction.create({
          data: {
            id: refundTxId,
            userId,
            bankAccountId,
            type: "REFUND",
            amount: originalTx.amount,
            fee: 0,
            status: "COMPLETED",
            currencyType: originalTx.currencyType,
            description: "RVSL refund",
            fromAccount: originalTx.toAccount,
            toAccount: originalTx.fromAccount,
            merchantName: originalTx.merchantName,
            category: "Refund",
            adminApprovalStatus: "APPROVED",
            approvalDate: new Date(),
          },
        }),

        prisma.bankAccount.update({
          where: { id: bankAccountId },
          data: {
            balance: { increment: totalAmount },
            availableBalance: { increment: totalAmount },
            lastActivityAt: new Date(),
          },
        }),

        prisma.user.update({
          where: { id: userId },
          data: {
            totalBalance: { increment: totalAmount },
          },
        }),

        prisma.transactionAuditLog.create({
          data: {
            transactionId: id,
           
            action: "REJECT",
            previousStatus: originalTx.status,
            newStatus: "FAILED",
           
          },
        }),
      ]);

      return NextResponse.json({
        message: "Transaction rejected. Refund transaction created.",
        refundTransactionId: refundTxId,
        transaction: { id, status: "FAILED" },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin approval error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
