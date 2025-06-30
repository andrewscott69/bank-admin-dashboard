"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

type Customer = {
  id: string;
  autoApprovedTransaction: boolean;
  
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/users")
      .then(res => res.json())
      .then(data => {
        const storedToggles = JSON.parse(localStorage.getItem("autoToggles") || "{}")
        const mergedUsers = data.map((user: any) => ({
          ...user,
          autoApprovedTransaction:
            storedToggles[user.id] !== undefined
              ? storedToggles[user.id]
              : user.autoApprovedTransaction,
        }))
        setUsers(mergedUsers)
      })
  }, [])

  const persistToggleState = (id: string, value: boolean) => {
    const current = JSON.parse(localStorage.getItem("autoToggles") || "{}")
    current[id] = value
    localStorage.setItem("autoToggles", JSON.stringify(current))
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user and all related data?")) return
    await fetch(`/api/dashboard/users/${userId}`, { method: "DELETE" })
    setUsers(prev => prev.filter(u => u.id !== userId))
    setDetailsOpen(false)
  }

  const handleToggleAutoApproval = async (
    customerId: string,
    currentStatus: boolean
  ) => {
    setLoadingActionId(customerId);
    try {
      const res = await fetch(
        `/api/dashboard/users/${customerId}/toggle-approval`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoApprovedTransaction: !currentStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to toggle auto approval");

      persistToggleState(customerId, !currentStatus);

      setUsers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? { ...c, autoApprovedTransaction: !currentStatus }
            : c
        )
      );
    } catch (error) {
      alert("Error updating auto approval status");
      console.error(error);
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">User Management</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm border rounded-md overflow-hidden">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Full Name</th>
                <th className="text-left px-4 py-2 font-medium">Email</th>
                <th className="text-center px-4 py-2 font-medium">Accounts</th>
                <th className="text-center px-4 py-2 font-medium">Cards</th>
                <th className="text-center px-4 py-2 font-medium">Auto Approval</th>
                <th className="text-center px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user.id}
                  className={cn(
                    "transition-colors hover:bg-muted/50",
                    i % 2 === 1 ? "bg-muted/10" : ""
                  )}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="text-center px-4 py-3">{user._count?.bankAccounts || 0}</td>
                  <td className="text-center px-4 py-3">{user._count?.cards || 0}</td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2 justify-center">
                      <Switch
                        checked={user.autoApprovedTransaction}
                        onCheckedChange={() =>
                          handleToggleAutoApproval(
                            user.id,
                            user.autoApprovedTransaction
                          )
                        }
                        disabled={loadingActionId === user.id}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <span className="text-xs text-slate-600">
                        {user.autoApprovedTransaction ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </td>
                  <td className="text-center px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setDetailsOpen(true)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {selectedUser && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">User Details</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Profile</h3>
                <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phoneNumber || "-"}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mt-4">Bank Accounts</h3>
                {selectedUser.bankAccounts?.length > 0 ? (
                  <ul className="pl-4 space-y-1">
                    {selectedUser.bankAccounts.map((account: any) => (
                      <li key={account.id}>
                        • <strong>{account.accountName}</strong> — {account.accountNumber} — ${account.balance.toFixed(2)} ({account.accountType})
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-muted-foreground">No accounts.</p>}
              </div>

              <div>
                <h3 className="font-semibold text-lg mt-4">Cards</h3>
                {selectedUser.cards?.length > 0 ? (
                  <ul className="pl-4 space-y-1">
                    {selectedUser.cards.map((card: any) => (
                      <li key={card.id}>
                        • <strong>{card.name}</strong> — **** {card.cardNumber.slice(-4)} ({card.type}, {card.network || "N/A"}) — {card.isActive ? "Active" : "Inactive"} — ${card.balance.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-muted-foreground">No cards.</p>}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
                <Button variant="destructive" onClick={() => handleDelete(selectedUser.id)}>Delete User</Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
