import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, CreditCard, Activity } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into banking operations and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-green-600">+$2.4M from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Growth</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+8.1%</div>
            <p className="text-xs text-blue-600">+1,047 new customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15.3%</div>
            <p className="text-xs text-purple-600">47,291 transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Card Utilization</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73.2%</div>
            <p className="text-xs text-orange-600">8,432 active cards</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Revenue and transaction trends over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Revenue</span>
                <Badge className="bg-green-100 text-green-800">+12.5%</Badge>
              </div>
              <Progress value={85} className="h-3" />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transaction Count</span>
                <Badge className="bg-blue-100 text-blue-800">+15.3%</Badge>
              </div>
              <Progress value={92} className="h-3" />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Customer Satisfaction</span>
                <Badge className="bg-purple-100 text-purple-800">+5.2%</Badge>
              </div>
              <Progress value={78} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Categories</CardTitle>
            <CardDescription>Breakdown of transaction types and volumes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Deposits</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">42%</span>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "42%" }}></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Withdrawals</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">28%</span>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: "28%" }}></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Transfers</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">20%</span>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Payments</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">10%</span>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>Current risk levels and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Credit Risk</span>
                <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Fraud Detection</span>
                <Badge className="bg-green-100 text-green-800">Low</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Operational Risk</span>
                <Badge className="bg-green-100 text-green-800">Low</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Compliance</span>
                <Badge className="bg-green-100 text-green-800">Compliant</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Demographics</CardTitle>
            <CardDescription>Age and location distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">18-25 years</span>
                <span className="text-sm font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">26-35 years</span>
                <span className="text-sm font-medium">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">36-50 years</span>
                <span className="text-sm font-medium">30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">50+ years</span>
                <span className="text-sm font-medium">20%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Uptime and response metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Response Time</span>
                <span className="text-sm font-medium">120ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="text-sm font-medium text-green-600">0.01%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Peak Load</span>
                <span className="text-sm font-medium">1,847 TPS</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
