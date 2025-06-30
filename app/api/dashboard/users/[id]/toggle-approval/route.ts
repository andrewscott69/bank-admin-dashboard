import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { autoApprovedTransaction: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        autoApprovedTransaction: !user.autoApprovedTransaction,
      },
    })

    return NextResponse.json({
      message: "Auto-approval updated",
      autoApprovedTransaction: updatedUser.autoApprovedTransaction,
    })
  } catch (error) {
    console.error("Toggle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
