
import { PrismaClient, BankAccountStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [totalCustomers, totalDeposits, activeCards, monthlyTransactions, pendingAccounts] = await Promise.all([
      prisma.user.count(),
      prisma.bankAccount.aggregate({
        _sum: { balance: true },
      }),
      prisma.card.count({ where: { isActive: true } }),
      prisma.transaction.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.bankAccount.findMany({
        where: { status: BankAccountStatus.PENDING_APPROVAL },
        select: {
          id: true,
          accountName: true,
          accountType: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalCustomers,
      totalDeposits: totalDeposits._sum.balance || 0,
      activeCards,
      monthlyTransactions,
      pendingAccounts,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
