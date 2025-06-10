"use client"

import { useEffect, useState } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users, DollarSign, CreditCard, TrendingUp,
  AlertTriangle, CheckCircle, Clock, Wallet,
} from "lucide-react"

interface User {
  firstName: string
  lastName: string
  email: string
}

interface PendingAccount {
  id: string
  accountName: string
  accountType: string
  user: User
}

interface DashboardMetrics {
  totalCustomers: number
  totalDeposits: number
  activeCards: number
  monthlyTransactions: number
  pendingAccounts: PendingAccount[]
}

interface AdminInfo {
  firstName: string
  lastName: string
  email: string
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [admin, setAdmin] = useState<AdminInfo | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, adminRes] = await Promise.all([
          fetch("/api/dashboard/metrics"),
          fetch("/api/admin/me"),
        ])

        if (!metricsRes.ok) throw new Error("Failed to load metrics")
        if (!adminRes.ok) throw new Error("Failed to load admin info")

        const metricsData = await metricsRes.json()
        const adminData = await adminRes.json()

        setMetrics(metricsData)
        setAdmin(adminData.admin)
      } catch (error) {
        console.error("Dashboard data loading error:", error)
      }
    }

    fetchData()
  }, [])

  if (!metrics || !admin) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {admin.firstName} {admin.lastName}. Here's your bank overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground"><span className="text-green-600">+2.3%</span> from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalDeposits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground"><span className="text-green-600">+12.5%</span> from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCards.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground"><span className="text-green-600">+5.7%</span> from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.monthlyTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground"><span className="text-green-600">+8.1%</span> from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Approval Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Account Approval Queue
            </CardTitle>
            <CardDescription>Accounts pending approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.pendingAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {account.user.firstName} {account.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{account.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{account.accountType}</Badge>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current system health and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Transaction Processing", value: 98, color: "text-green-600" },
              { label: "Card Services", value: 95, color: "text-green-600" },
              { label: "Mobile Banking", value: 85, color: "text-yellow-600" },
              { label: "Admin Wallets", value: 100, color: "text-green-600" },
            ].map((status, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{status.label}</span>
                  <Badge variant="outline" className={status.color}>Operational</Badge>
                </div>
                <Progress value={status.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and user activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "New account created", user: "Emma Wilson", time: "2 minutes ago", type: "success" },
              { action: "Large transaction detected", user: "Robert Chen", time: "5 minutes ago", type: "warning" },
              { action: "Identity verification completed", user: "Maria Garcia", time: "12 minutes ago", type: "success" },
              { action: "Failed login attempt", user: "Unknown", time: "18 minutes ago", type: "error" },
              { action: "Wallet address added", user: "System Admin", time: "25 minutes ago", type: "info" },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {activity.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {activity.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                  {activity.type === "error" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {activity.type === "info" && <Wallet className="h-4 w-4 text-blue-600" />}
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.user}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
