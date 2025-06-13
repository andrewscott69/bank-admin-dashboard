import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sub } from "date-fns";
import {
  TransactionStatus,
  AdminApprovalStatus,
  CurrencyType,
  TransactionType,
} from "@prisma/client";

const CATEGORIES = ["Utilities", "Payroll", "Legal", "Construction", "Consulting", "Wholesale", "Logistics", "Healthcare", "Manufacturing", "Education", "Finance", "Retail", "IT", "Energy"];
const TRANSFER_TYPES = ["Local", "International", "Wire"];
const COMPANY_NAMES = [
  "Nexora Systems", "Orion Freight", "Vertex Dynamics", "EchoSoft Solutions", "PolarStone Inc", "Apexon Ventures", "GlobalEdge Capital", "Zephyra Technologies",
  "BrightLink Industries", "NovaTrail Holdings", "Magnetar Services", "Corewise Labs", "Tesseract Media", "Gravix Partners", "DeepBay Logistics",
  "Quantex Power", "Lumetra Group", "HelionTec", "Omniview Holdings", "StratusCore", "Zenvio Ventures", "Parallax Finance", "BlueSpire Analytics",
  "Infinitum Logistics", "Arclight Data", "Reviva MedTech", "Solvix Holdings", "Teranova Construction", "Quantix AI", "NimbusPay Solutions",
  "Neurovia Health", "Skyforge Tech", "Ironvale Legal", "Opthona Ltd", "EchoPay Group", "Primex Connect", "Volturex Group", "Xenetra", "Astrelon Corp", "Vectronix"
];
const FIRST_NAMES = ["James", "Olivia", "Liam", "Emma", "Noah", "Ava", "Elijah", "Sophia", "William", "Isabella", "Lucas", "Mia", "Henry", "Charlotte", "Benjamin", "Amelia", "Jack", "Harper", "Daniel", "Luna"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount() {
  return parseFloat((Math.random() * 1000 + 10).toFixed(2));
}

function randomDateWithin(duration: string) {
  const now = new Date();
  const [value, unit] = [parseInt(duration), duration.replace(/\d/, "").toLowerCase()];
  const start = sub(now, {
    years: unit.includes("y") ? value : 0,
    months: unit.includes("m") ? value : 0,
  });
  return new Date(start.getTime() + Math.random() * (now.getTime() - start.getTime()));
}

function randomIban() {
  return `DE${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`;
}

function randomSwift() {
  return `${getRandom(FIRST_NAMES).substring(0, 4).toUpperCase()}${Math.floor(10 + Math.random() * 90)}`;
}

function randomRoutingNumber() {
  return `${Math.floor(100000000 + Math.random() * 900000000)}`;
}

function randomTxHash() {
  return `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
}

function randomReference() {
  return `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

function randomBankAddress() {
  return `${Math.floor(Math.random() * 9999)} ${getRandom(LAST_NAMES)} Street, ${getRandom(["NY", "CA", "TX", "FL", "WA"])} USA`;
}

function randomRecipientName(): string {
  return Math.random() < 0.5
    ? `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`
    : getRandom(COMPANY_NAMES);
}

function getDescription(type: TransactionType, transferType: string, recipient: string): string {
  switch (type) {
    case TransactionType.TRANSFER:
      return `${transferType} transfer to ${recipient}`;
    case TransactionType.DEPOSIT:
      return Math.random() > 0.5 ? `Bank deposit from ${recipient}` : `Transfer from ${recipient}`;
    case TransactionType.WITHDRAWAL:
      return `Withdrawal by ${recipient}`;
    case TransactionType.REFUND:
      return `RVSL refund from ${recipient}`;
    default:
      return `Transaction with ${recipient}`;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: bankAccountId } = params;
    const body = await req.json();
    const { duration = "1y" } = body;

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
      include: { user: true },
    });

    if (!bankAccount || !bankAccount.user) {
      return NextResponse.json(
        { error: "Bank account or user not found" },
        { status: 404 }
      );
    }

    const { userId, currencyType, accountNumber: fromAccount } = bankAccount;

    const fakeTransactions = Array.from({ length: 50 }, () => {
      const type = getRandom([
        TransactionType.TRANSFER,
        TransactionType.DEPOSIT,
        TransactionType.WITHDRAWAL,
        TransactionType.REFUND,
      ]);
      const transferType = getRandom(TRANSFER_TYPES);
      const recipientName = randomRecipientName();
      const date = randomDateWithin(duration);
      const amount = randomAmount();
      const fee = parseFloat((Math.random() * 5).toFixed(2));
      const recipientAccount = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const description = getDescription(type, transferType, recipientName);

      return {
        id: `SIMTX${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        userId,
        bankAccountId,
        type,
        amount,
        fee,
        status: TransactionStatus.COMPLETED,
        currencyType,
        description,
        reference: randomReference(),
        txHash: randomTxHash(),
        fromAccount: type === TransactionType.DEPOSIT ? null : fromAccount,
        toAccount: type === TransactionType.WITHDRAWAL ? null : recipientAccount,
        recipientName,
        recipientAccount,
        recipientBank: `${getRandom(COMPANY_NAMES)} Bank`,
        recipientBankAddress: randomBankAddress(),
        recipientCountry: getRandom(["US", "UK", "DE", "FR", "CA", "JP", "SG", "AU"]),
        swiftCode: randomSwift(),
        iban: randomIban(),
        intermediaryBank: `${getRandom(COMPANY_NAMES)} Intermediary`,
        estimatedArrival: `${Math.floor(1 + Math.random() * 4)}-${Math.floor(5 + Math.random() * 5)} business days`,
        routingNumber: randomRoutingNumber(),
        transferType,
        merchantName: getRandom(COMPANY_NAMES),
        category: getRandom(CATEGORIES),
        adminApprovalStatus: AdminApprovalStatus.APPROVED,
        approvalDate: date,
        scheduledDate: date,
        processingDate: date,
        completionDate: date,
        createdAt: date,
        updatedAt: date,
      };
    });

    await prisma.transaction.createMany({ data: fakeTransactions });

    return NextResponse.json({
      message: `50 fake transactions generated over the last ${duration}`,
    });
  } catch (error) {
    console.error("Transaction generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
