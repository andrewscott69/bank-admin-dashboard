"use client"

import { useState, useEffect, useMemo } from "react"

import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download, Filter } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

type Transaction = {
  id: string
  type: string
  amount: number
  status: string
  user: {
    firstName?: string
    lastName?: string
    email: string
  }
  createdAt: string
  currency?: string
  description?: string
}

export function DataTable() {
  const [data, setData] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const [isApproving, setIsApproving] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true)
      try {
        const res = await fetch("/api/dashboard/transactions")
        if (!res.ok) throw new Error("Failed to fetch transactions")
        const transactions = await res.json()
        setData(transactions)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const handleApprove = async (transactionId: string) => {
    setIsApproving(transactionId)
    try {
      const res = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "approve" }),
      })

      if (!res.ok) throw new Error("Approval failed")

      const result = await res.json()
      console.log("Approval success:", result)

      // Update local state
      setData((prevData) =>
        prevData.map((t) =>
          t.id === transactionId
            ? { ...t, status: result.transaction.status }
            : t
        )
      )
    } catch (err) {
      console.error(err)
      alert("Error approving transaction")
    } finally {
      setIsApproving(null)
    }
  }

  const getStatusBadge = (status: string) => {
    let color = "gray"

    if (status === "COMPLETED" || status === "APPROVED") color = "green"
    else if (status === "PENDING") color = "orange"
    else if (status === "FAILED") color = "red"
    else if (status === "PROCESSING") color = "blue"

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full text-white bg-${color}-500`}
      >
        {status}
      </span>
    )
  }

  const filteredTransactions = useMemo(() => {
    return data.filter((transaction) => {
      const matchesSearch =
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${transaction.user.firstName ?? ""} ${transaction.user.lastName ?? ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.description ?? "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [data, searchTerm, statusFilter, typeFilter])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all customer transactions
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Transactions
        </Button>
      </div>

      {/* Transaction Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.1%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {data.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.filter((t) => t.status === "FAILED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+2.3%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.filter((t) => t.status === "PENDING").length}
            </div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View and filter all customer transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, transaction ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="DEPOSIT">Deposit</SelectItem>
                <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
                <SelectItem value="PAYMENT">Payment</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Transaction Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>
                      {`${transaction.user.firstName ?? ""} ${
                        transaction.user.lastName ?? ""
                      }`.trim() || transaction.user.email}
                    </TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>
                      {transaction.currency === "USD" ? "$" : ""}
                      {transaction.amount.toLocaleString()}
                      {transaction.currency !== "USD" ? ` ${transaction.currency}` : ""}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.description ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        disabled={transaction.status !== "PENDING" || isApproving === transaction.id}
                        onClick={() => handleApprove(transaction.id)}
                      >
                        {transaction.status === "PENDING"
                          ? isApproving === transaction.id
                            ? "Approving..."
                            : "Approve"
                          : "No Action"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
