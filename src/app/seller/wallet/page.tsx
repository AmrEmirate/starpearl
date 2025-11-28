"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpRight, History } from "lucide-react";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  bankName: string;
  bankAccount: string;
  createdAt: string;
}

export default function SellerWalletPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankUser, setBankUser] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "SELLER")) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && user?.role === "SELLER") {
      fetchData();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceRes, withdrawalsRes] = await Promise.all([
        api.get("/withdrawals/balance"),
        api.get("/withdrawals"),
      ]);
      setBalance(balanceRes.data.data.balance);
      setWithdrawals(withdrawalsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch wallet data", error);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) < 10000) {
      toast.error("Minimum withdrawal is Rp 10.000");
      return;
    }
    if (parseFloat(amount) > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/withdrawals", {
        amount: parseFloat(amount),
        bankName,
        bankAccount,
        bankUser,
      });
      toast.success("Withdrawal requested successfully");
      fetchData(); // Refresh data
      // Reset form
      setAmount("");
      setBankName("");
      setBankAccount("");
      setBankUser("");
    } catch (error: any) {
      console.error("Failed to request withdrawal", error);
      toast.error(
        error.response?.data?.message || "Failed to request withdrawal"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Wallet className="h-8 w-8" /> My Wallet
        </h1>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Balance Card */}
          <Card className="md:col-span-1 bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-medium opacity-90">
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(balance)}
              </div>
              <p className="text-sm opacity-80 mt-2">
                Available for withdrawal
              </p>
            </CardContent>
          </Card>

          {/* Withdrawal Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5" /> Request Withdrawal
              </CardTitle>
              <CardDescription>
                Transfer funds to your bank account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (IDR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g. 50000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      placeholder="e.g. BCA, Mandiri"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Account Number</Label>
                    <Input
                      id="bankAccount"
                      placeholder="e.g. 1234567890"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankUser">Account Holder Name</Label>
                    <Input
                      id="bankUser"
                      placeholder="e.g. John Doe"
                      value={bankUser}
                      onChange={(e) => setBankUser(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting || balance <= 0}
                >
                  {submitting ? "Processing..." : "Request Withdrawal"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Withdrawal History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No withdrawal history found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>
                        {format(new Date(w.createdAt), "PPP")}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(w.amount)}
                      </TableCell>
                      <TableCell>
                        {w.bankName} - {w.bankAccount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            w.status === "APPROVED"
                              ? "default"
                              : w.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {w.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
