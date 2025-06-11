"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Users,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wallet,
  FileX,
  UserX,
  Activity,
  Bell,
  ArrowUpRight,
  Zap,
  Shield,
  Database,
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

interface ActivityItem {
  action: string
  user: string
  time: string
  type: "success" | "warning" | "error" | "info"
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [admin, setAdmin] = useState<AdminInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, adminRes] = await Promise.all([fetch("/api/dashboard/metrics"), fetch("/api/admin/me")])

        if (!metricsRes.ok) throw new Error("Failed to load metrics")
        if (!adminRes.ok) throw new Error("Failed to load admin info")

        const metricsData = await metricsRes.json()
        const adminData = await adminRes.json()

        setMetrics(metricsData)
        setAdmin(adminData.admin)
      } catch (error) {
        console.error("Dashboard data loading error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{description}</p>
    </div>
  )

  const recentActivities: ActivityItem[] = [
    { action: "New account created", user: "Emma Wilson", time: "2 minutes ago", type: "success" },
    { action: "Large transaction detected", user: "Robert Chen", time: "5 minutes ago", type: "warning" },
    { action: "Identity verification completed", user: "Maria Garcia", time: "12 minutes ago", type: "success" },
    { action: "Failed login attempt", user: "Unknown", time: "18 minutes ago", type: "error" },
    { action: "Wallet address added", user: "System Admin", time: "25 minutes ago", type: "info" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!metrics || !admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <EmptyState
          icon={AlertTriangle}
          title="Unable to load dashboard"
          description="There was an error loading your dashboard data. Please try refreshing the page."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-600 text-lg">
              Welcome back,{" "}
              <span className="font-semibold text-slate-800">
                {admin.firstName} {admin.lastName}
              </span>
              . Here's your bank overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-slate-200">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <Activity className="w-4 h-4 mr-2" />
              Live Activity
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-blue-700">Total Customers</CardTitle>
                <div className="text-3xl font-bold text-blue-900 mt-2">{metrics.totalCustomers.toLocaleString()}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-200/50 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <ArrowUpRight className="w-4 h-4 text-emerald-600 mr-1" />
                <span className="text-emerald-600 font-medium">+2.3%</span>
                <span className="text-blue-600 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-emerald-100 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-emerald-700">Total Deposits</CardTitle>
                <div className="text-3xl font-bold text-emerald-900 mt-2">
                  ${metrics.totalDeposits.toLocaleString()}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-200/50 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <ArrowUpRight className="w-4 h-4 text-emerald-600 mr-1" />
                <span className="text-emerald-600 font-medium">+12.5%</span>
                <span className="text-emerald-600 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-purple-700">Active Cards</CardTitle>
                <div className="text-3xl font-bold text-purple-900 mt-2">{metrics.activeCards.toLocaleString()}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-200/50 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <ArrowUpRight className="w-4 h-4 text-emerald-600 mr-1" />
                <span className="text-emerald-600 font-medium">+5.7%</span>
                <span className="text-purple-600 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-amber-700">Monthly Transactions</CardTitle>
                <div className="text-3xl font-bold text-amber-900 mt-2">
                  {metrics.monthlyTransactions.toLocaleString()}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-200/50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <ArrowUpRight className="w-4 h-4 text-emerald-600 mr-1" />
                <span className="text-emerald-600 font-medium">+8.1%</span>
                <span className="text-amber-600 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Account Approval Queue */}
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                Account Approval Queue
              </CardTitle>
              <CardDescription className="text-slate-600">
                Accounts pending approval ({metrics.pendingAccounts.length} pending)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {metrics.pendingAccounts.length === 0 ? (
                <EmptyState
                  icon={UserX}
                  title="No pending approvals"
                  description="All accounts have been processed. New pending accounts will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {metrics.pendingAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {account.user.firstName[0]}
                          {account.user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {account.user.firstName} {account.user.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{account.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {account.accountType}
                        </Badge>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                System Status
              </CardTitle>
              <CardDescription className="text-slate-600">
                Current system health and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  { label: "Transaction Processing", value: 98, color: "bg-emerald-500", icon: Zap },
                  { label: "Card Services", value: 95, color: "bg-emerald-500", icon: CreditCard },
                  { label: "Mobile Banking", value: 85, color: "bg-amber-500", icon: Users },
                  { label: "Database Systems", value: 100, color: "bg-emerald-500", icon: Database },
                ].map((status, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <status.icon className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="font-medium text-slate-900">{status.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">{status.value}%</span>
                        <Badge
                          variant="outline"
                          className={`${status.value >= 95 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                        >
                          {status.value >= 95 ? "Operational" : "Degraded"}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={status.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-slate-800">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-slate-600">Latest system events and user activities</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="bg-white/80">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {recentActivities.length === 0 ? (
              <EmptyState
                icon={FileX}
                title="No recent activity"
                description="System activities and user events will appear here as they occur."
              />
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === "success"
                            ? "bg-emerald-100"
                            : activity.type === "warning"
                              ? "bg-amber-100"
                              : activity.type === "error"
                                ? "bg-red-100"
                                : "bg-blue-100"
                        }`}
                      >
                        {activity.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                        {activity.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                        {activity.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600" />}
                        {activity.type === "info" && <Wallet className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{activity.action}</p>
                        <p className="text-sm text-slate-500">{activity.user}</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-400 font-medium">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
