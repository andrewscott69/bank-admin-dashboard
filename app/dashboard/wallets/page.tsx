"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Wallet, Eye, EyeOff, Copy, MoreHorizontal, Power, PowerOff } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const adminWallets = [
  {
    id: "1",
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    currencyType: "BTC",
    balance: 15.42856789,
    isActive: true,
    createdAt: "2024-01-10 14:30",
    lastUsed: "2024-01-15 10:20",
  },
  {
    id: "2",
    address: "0x742d35cc6bf8b2c8f0a7fe9db2d21a82bf7b7e3f",
    currencyType: "USDT",
    balance: 125420.5,
    isActive: true,
    createdAt: "2024-01-08 09:15",
    lastUsed: "2024-01-15 16:45",
  },
  {
    id: "3",
    address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    currencyType: "SOL",
    balance: 89.234567,
    isActive: false,
    createdAt: "2024-01-05 11:20",
    lastUsed: "2024-01-12 08:30",
  },
  {
    id: "4",
    address: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    currencyType: "USD",
    balance: 50000.0,
    isActive: true,
    createdAt: "2024-01-03 16:45",
    lastUsed: "2024-01-15 14:10",
  },
]

export default function WalletsPage() {
  const [wallets, setWallets] = useState(adminWallets)
  const [showAddress, setShowAddress] = useState<{ [key: string]: boolean }>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const toggleAddressVisibility = (walletId: string) => {
    setShowAddress((prev) => ({
      ...prev,
      [walletId]: !prev[walletId],
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const toggleWalletStatus = (walletId: string) => {
    setWallets((prev) =>
      prev.map((wallet) => (wallet.id === walletId ? { ...wallet, isActive: !wallet.isActive } : wallet)),
    )
  }

  const maskAddress = (address: string) => {
    if (address.length <= 8) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getCurrencyIcon = (currency: string) => {
    const icons: { [key: string]: string } = {
      BTC: "₿",
      USDT: "$",
      SOL: "◎",
      USD: "$",
      EUR: "€",
      GBP: "£",
    }
    return icons[currency] || "$"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Wallet Management</h1>
          <p className="text-muted-foreground">Manage cryptocurrency and fiat wallets for the platform</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Admin Wallet</DialogTitle>
              <DialogDescription>Add a new cryptocurrency or fiat wallet address to the platform.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    <SelectItem value="SOL">Solana (SOL)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Wallet Address</Label>
                <Input
                  id="address"
                  placeholder="Enter wallet address or account number"
                  className="font-mono text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balance">Initial Balance (Optional)</Label>
                <Input id="balance" type="number" placeholder="0.00" step="0.00000001" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsAddDialogOpen(false)}>
                Add Wallet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wallet Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets.filter((w) => w.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total BTC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₿
              {wallets
                .filter((w) => w.currencyType === "BTC")
                .reduce((acc, w) => acc + w.balance, 0)
                .toFixed(8)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total USD Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Admin Wallets
          </CardTitle>
          <CardDescription>Manage and monitor all admin wallet addresses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCurrencyIcon(wallet.currencyType)}</span>
                        <Badge variant="outline">{wallet.currencyType}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {showAddress[wallet.id] ? wallet.address : maskAddress(wallet.address)}
                        </code>
                        <Button variant="ghost" size="sm" onClick={() => toggleAddressVisibility(wallet.id)}>
                          {showAddress[wallet.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(wallet.address)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getCurrencyIcon(wallet.currencyType)}
                      {wallet.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {wallet.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Power className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <PowerOff className="mr-1 h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{wallet.lastUsed}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleWalletStatus(wallet.id)}>
                            {wallet.isActive ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Disable Wallet
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Enable Wallet
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyToClipboard(wallet.address)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Address
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Remove Wallet</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Security</CardTitle>
            <CardDescription>Security settings and monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-disable inactive wallets</p>
                <p className="text-sm text-muted-foreground">Disable wallets after 30 days of inactivity</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Address verification</p>
                <p className="text-sm text-muted-foreground">Verify wallet addresses before transactions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transaction alerts</p>
                <p className="text-sm text-muted-foreground">Alert on large transactions</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Analytics</CardTitle>
            <CardDescription>Usage statistics and insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Most used currency:</span>
              <Badge>USDT</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Average transaction size:</span>
              <span className="text-sm">$15,420</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Daily transaction volume:</span>
              <span className="text-sm">$2.4M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Failed transactions (24h):</span>
              <span className="text-sm text-red-600">3</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
