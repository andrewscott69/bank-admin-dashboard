"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Trash2,
} from "lucide-react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBalance: number;
  accountType: string;
  status: string;
  lastActivity: string;
  joinDate: string;
};

type Stats = {
  total: number;
  active: number;
  pendingApproval: number;
  suspended: number;
};

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/dashboard/customers");
        const { customers, stats } = await res.json();
        setCustomers(customers);
        setStats(stats);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.name?.toLowerCase() || "";
    const email = customer.email?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    const normalized = status.toUpperCase();

    const baseClasses =
      "pointer-events-none hover:bg-transparent hover:text-inherit";

    switch (normalized) {
      case "ACTIVE":
        return (
          <Badge className={`bg-green-100 text-green-800 ${baseClasses}`}>
            Active
          </Badge>
        );
      case "PENDING_APPROVAL":
        return (
          <Badge className={`bg-yellow-100 text-yellow-800 ${baseClasses}`}>
            Pending
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge className={`bg-red-100 text-red-800 ${baseClasses}`}>
            Suspended
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge className={`bg-gray-200 text-gray-800 ${baseClasses}`}>
            Inactive
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge className={`bg-slate-200 text-slate-800 ${baseClasses}`}>
            Closed
          </Badge>
        );
      default:
        return (
          <Badge className={baseClasses} variant="outline">
            {status}
          </Badge>
        );
    }
  };

  async function handleUpdateStatus(id: string, action: "approve" | "suspend") {
    setLoadingActionId(id);
    try {
      const res = await fetch(`/api/dashboard/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update account");

      const updatedAccount = await res.json();

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: action === "approve" ? "ACTIVE" : "SUSPENDED" }
            : c
        )
      );
    } catch (error) {
      alert("Error updating account status");
      console.error(error);
    } finally {
      setLoadingActionId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this account?")) return;
    setLoadingActionId(id);
    try {
      const res = await fetch(`/api/dashboard/customers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete account");

      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      alert("Error deleting account");
      console.error(error);
    } finally {
      setLoadingActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage all customer accounts and activities
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pendingApproval ?? "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.suspended ?? "—"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>Search and manage customer accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground">
              Loading customers...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Total Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{customer.accountType}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        $
                        {typeof customer.totalBalance === "number"
                          ? customer.totalBalance.toLocaleString()
                          : "0.00"}
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {customer.lastActivity}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="btn">...</button> 
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(customer.id, "approve")
                              }
                              disabled={loadingActionId === customer.id}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Approve Account
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(customer.id, "suspend")
                              }
                              disabled={loadingActionId === customer.id}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend Account
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDelete(customer.id)}
                              disabled={loadingActionId === customer.id}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
