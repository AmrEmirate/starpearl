"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { format } from "date-fns";

interface Withdrawal {
  id: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  bankUser: string;
  createdAt: string;
  store: {
    name: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/withdrawals/pending");
      setWithdrawals(response.data.data);
    } catch (error) {
      console.error("Failed to fetch withdrawals", error);
      toast.error("Failed to fetch pending withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleProcess = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.patch(`/admin/withdrawals/${id}/process`, { status });
      toast.success(`Withdrawal ${status.toLowerCase()} successfully`);
      fetchWithdrawals();
    } catch (error) {
      console.error("Failed to process withdrawal", error);
      toast.error("Failed to update withdrawal status");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Pending Withdrawals</h1>

      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Bank Details</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No pending withdrawal requests.
                </TableCell>
              </TableRow>
            ) : (
              withdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{format(new Date(w.createdAt), "PPP")}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{w.store.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {w.store.user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(w.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{w.bankName}</span>
                      <span>{w.bankAccount}</span>
                      <span className="text-muted-foreground">
                        {w.bankUser}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleProcess(w.id, "APPROVED")}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleProcess(w.id, "REJECTED")}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
