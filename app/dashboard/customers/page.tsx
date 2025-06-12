"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  Plus,
} from "lucide-react";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  totalBalance: number;
  accountType: string;
  status: string;
  lastActivity: string;
  joinDate: string;
  autoApprovedTransaction: boolean;
  isVerified: boolean;
};

type Stats = {
  total: number;
  active: number;
  pendingApproval: number;
  suspended: number;
  totalBalance: number;
};

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);

  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [customerBankDetails, setCustomerBankDetails] = useState<any>(null);

  
  const [addFundsDialog, setAddFundsDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [fundAmount, setFundAmount] = useState("");
  const [addingFunds, setAddingFunds] = useState(false);

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

  const handleViewDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewDetailsDialog(true);

    try {
      const res = await fetch(`/api/dashboard/customers/${customer.id}`);
      const data = await res.json();
      setCustomerBankDetails(data.bankAccount || null);
    } catch (error) {
      console.error("Failed to fetch customer bank details", error);
    }
  };

  const handleAddFundsDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setAddFundsDialog(true);

    try {
      const res = await fetch(`/api/dashboard/customers/${customer.id}`);
      const data = await res.json();
      setCustomerBankDetails(data.bankAccount || null);
    } catch (error) {
      console.error("Failed to fetch customer bank details", error);
    }
  };

  // useEffect(() => {
  //   if (!selectedCustomer) return;

  //   const fetchBankAccounts = async () => {
  //     const res = await fetch(
  //       `/api/dashboard/customers/${selectedCustomer.id}`
  //     );
  //     const data = await res.json();
  //     setBankAccounts(data.accounts);
  //   };

  //   fetchBankAccounts();
  // }, [selectedCustomer]);

  const filteredCustomers = customers.filter((customer) => {
    const name = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const email = customer.email?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: string, isVerified: boolean) => {
    const normalized = status.toUpperCase();

    switch (normalized) {
      case "ACTIVE":
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
              Active
            </Badge>
            {isVerified && (
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
                Verified
              </Badge>
            )}
          </div>
        );
      case "PENDING_APPROVAL":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
            Pending
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
            Suspended
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50">
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddFunds = async () => {
    if (!customerBankDetails?.id || !fundAmount) return;
  
    try {
      setAddingFunds(true);
  
      const res = await fetch(`/api/dashboard/customers/${customerBankDetails.id}/add-funds`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(fundAmount) }),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.error || "Failed to add funds");
  
      setCustomerBankDetails(data.bankAccount);
      setSelectedCustomer((prev) =>
        prev ? { ...prev, totalBalance: data.customer.totalBalance } : null
      );
  
      alert("Funds added successfully");
      setAddFundsDialog(false);
      setFundAmount("");
    } catch (error) {
      console.error(error);
      alert("Failed to add funds");
    } finally {
      setAddingFunds(false);
    }
  };
  


  const handleToggleAutoApproval = async (
    customerId: string,
    currentStatus: boolean
  ) => {
    setLoadingActionId(customerId);
    try {
      const res = await fetch(
        `/api/dashboard/customers/${customerId}/toggle-approval`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoApprovedTransaction: !currentStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to toggle auto approval");

      setCustomers((prev) =>
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

  async function handleUpdateStatus(id: string, action: "approve" | "suspend") {
    setLoadingActionId(id);
    try {
      const res = await fetch(`/api/dashboard/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update account");

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
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Customer Management
          </h1>
          <p className="text-slate-600 text-lg">
            Manage all customer accounts and activities
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Enhanced Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total Customers
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {stats?.total ?? 0}
            </div>
            <p className="text-xs text-blue-600 mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-emerald-700">
                Active Accounts
              </CardTitle>
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">
              {stats?.active ?? "—"}
            </div>
            <p className="text-xs text-emerald-600 mt-1">+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-700">
                Pending Approval
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">
              {stats?.pendingApproval ?? "—"}
            </div>
            <p className="text-xs text-amber-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">
                Total Balance
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              ${stats?.totalBalance?.toLocaleString() ?? "—"}
            </div>
            <p className="text-xs text-purple-600 mt-1">Across all accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Table */}
      <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-slate-800">
                Customer Directory
              </CardTitle>
              <CardDescription className="text-slate-600">
                Search and manage customer accounts with enhanced controls
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 bg-white/80 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading customers...
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="font-semibold text-slate-700">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Balance
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Auto Approval
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Last Activity
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer, index) => (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-blue-50/30 transition-colors border-slate-100"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {customer.firstName?.[0]}
                            {customer.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {customer.email}
                            </div>
                            <div className="text-xs text-slate-400">
                              {customer.phoneNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-bold text-lg text-slate-900">
                          ${customer.totalBalance?.toLocaleString() ?? "0.00"}
                        </div>
                        <div className="text-xs text-slate-500">
                          Available balance
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(customer.status, customer.isVerified)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={customer.autoApprovedTransaction}
                            onCheckedChange={() =>
                              handleToggleAutoApproval(
                                customer.id,
                                customer.autoApprovedTransaction
                              )
                            }
                            disabled={loadingActionId === customer.id}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                          <span className="text-xs text-slate-600">
                            {customer.autoApprovedTransaction
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-slate-600">
                        {customer.lastActivity}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-slate-100"
                              disabled={loadingActionId === customer.id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                              onClick={() => handleAddFundsDetails(customer)}
                              className="text-emerald-600 focus:text-emerald-600"
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Add Funds
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleViewDetails(customer)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

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

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleDelete(customer.id)}
                              disabled={loadingActionId === customer.id}
                              className="text-red-600 focus:text-red-600"
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

      {/* Add Funds Dialog */}
      <Dialog open={addFundsDialog} onOpenChange={setAddFundsDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Add Funds
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-1">
              Add funds
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
           
            <input
              type="hidden"
              name="bankAccountId"
              value={customerBankDetails?.id || ""}
            />

            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-slate-600 font-medium">
                Account Name:
              </p>
              <p className="text-base text-slate-800">
                {customerBankDetails?.accountName}
              </p>

              <p className="text-sm text-slate-600 font-medium">
                Account Number:
              </p>
              <p className="text-base text-slate-800">
                ****{customerBankDetails?.accountNumber?.slice(-4)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="bg-slate-100 p-3 rounded-lg">
              <div className="text-sm text-slate-600">Current Balance:</div>
              <div className="text-lg font-semibold text-slate-900">
                ${customerBankDetails?.balance?.toLocaleString() || "0.00"}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setAddFundsDialog(false)}
              disabled={addingFunds}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFunds}
              disabled={!fundAmount || addingFunds}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {addingFunds ? "Adding..." : "Add Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDetailsDialog} onOpenChange={setViewDetailsDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Eye className="h-5 w-5 text-blue-600" />
              Account Details
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-1">
              {/* {customerBankDetails?.user.name}'s Bank Account Overview */}
            </DialogDescription>
          </DialogHeader>

          {!customerBankDetails ? (
            <div className="py-4 text-sm text-slate-500 text-center">
              No bank account available.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="border rounded-xl p-4 bg-slate-50 shadow-sm">
                <div className="space-y-1">
                  <p className="text-base font-medium text-slate-800">
                    {customerBankDetails.accountName}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                    <div>
                      <span className="block text-slate-500">Type</span>
                      {customerBankDetails.accountType}
                    </div>
                    <div>
                      <span className="block text-slate-500">Status</span>
                      {customerBankDetails.status}
                    </div>
                    <div>
                      <span className="block text-slate-500">Balance</span>$
                      {customerBankDetails.balance.toLocaleString()}
                    </div>
                    <div>
                      <span className="block text-slate-500">Opened</span>
                      {customerBankDetails.openedAt}
                    </div>
                    <div>
                      <span className="block text-slate-500">
                        Last Activity
                      </span>
                      {customerBankDetails.lastActivity}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">
                  Account Holder
                </h3>
                {/* <p className="text-sm text-slate-600">
                  {customerBankDetails.user.name}
                </p> */}
                {/* <p className="text-sm text-slate-500">
                  {customerBankDetails.user.email}
                </p>
                <p className="text-sm text-slate-500">
                  {customerBankDetails.user.phone}
                </p> */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
