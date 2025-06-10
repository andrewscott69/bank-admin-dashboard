import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const body = await request.json()
    const { autoApprovedTransaction } = body

    if (typeof autoApprovedTransaction !== "boolean") {
      return NextResponse.json({ error: "Invalid autoApprovedTransaction value" }, { status: 400 })
    }

    // Update user auto approval status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        autoApprovedTransaction,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: `Auto approval ${autoApprovedTransaction ? "enabled" : "disabled"} successfully`,
      autoApprovedTransaction: updatedUser.autoApprovedTransaction,
    })
  } catch (error) {
    console.error("Failed to toggle auto approval", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
