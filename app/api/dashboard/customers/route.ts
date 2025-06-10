// app/api/dashboard/customers/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const accounts = await prisma.bankAccount.findMany({
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
    })

    const transformed = accounts.map(account => ({
      id: account.id,
      name: `${account.user?.firstName ?? ""} ${account.user?.lastName ?? ""}`.trim(),
      email: account.user?.email ?? "",
      phone: account.user?.phoneNumber ?? "",
      totalBalance: account.balance,
      accountType: account.accountType,
      status: account.status,
      lastActivity: account.lastActivityAt?.toISOString().split("T")[0] ?? "N/A",
      joinDate: account.openedAt.toISOString().split("T")[0],
    }))

    
    const stats = {
        total: transformed.length,
        active: transformed.filter(c => c.status === "ACTIVE").length,
        pendingApproval: transformed.filter(c => c.status === "PENDING_APPROVAL").length,
        suspended: transformed.filter(c => c.status === "SUSPENDED").length,
        inactive: transformed.filter(c => c.status === "INACTIVE").length,
        closed: transformed.filter(c => c.status === "CLOSED").length,
      }
      

    return NextResponse.json({ customers: transformed, stats })
  } catch (error) {
    console.error("Failed to fetch customers", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
