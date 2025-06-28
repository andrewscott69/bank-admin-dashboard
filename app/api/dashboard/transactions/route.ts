import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          createdAt: true,
          currencyType: true,
          description: true,
          reference: true,
          txHash: true,
          fee: true,
          transferType: true,
          estimatedArrival: true,

          // Recipient Information
          recipientName: true,
          recipientAccount: true,
          recipientBank: true,
          recipientBankAddress: true,
          recipientCountry: true,
          swiftCode: true,
          routingNumber: true,
          iban: true,
          intermediaryBank: true,

          // User Info
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },

          // Bank Account Info
          bankAccount: {
            select: {
              accountName: true,
              accountNumber: true,
              routingNumber: true,
              accountType: true,
              currencyType: true,
              status: true,
            },
          },
        },
      }),
      prisma.transaction.count(),
    ]);

    return NextResponse.json({ transactions, total });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
