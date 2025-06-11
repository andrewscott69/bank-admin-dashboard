export async function GET(req: Request, { params }: { params: { id: string } }) {
  const customerId = params.id;
  if (!customerId) {
    return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
  }

  try {
    const accounts = await prisma.bankAccount.findMany({
      where: { userId: customerId },
      select: {
        id: true,
        accountName: true,        
        accountNumber: true,
        balance: true,
        availableBalance: true,
        status: true,
      },
    });

    if (accounts.length === 0) {
      return NextResponse.json({ error: "No bank accounts found for this customer" }, { status: 404 });
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch bank accounts" }, { status: 500 });
  }
}
