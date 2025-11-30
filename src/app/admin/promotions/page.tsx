"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Ticket } from "lucide-react";
import Link from "next/link";

interface Voucher {
  id: string;
  code: string;
  discountAmount: number;
  minSpend: number;
  isActive: boolean;
}

export default function AdminPromotionsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newVoucher, setNewVoucher] = useState<Partial<Voucher>>({});

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router, loading]);

  useEffect(() => {
    loadVouchers();
  }, []);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const { data } = await api.get("/admin/promotions");
      setVouchers(data.data);
    } catch (error) {
      console.error("Failed to load vouchers", error);
      toast.error("Failed to load vouchers");
    }
  };

  const handleAdd = async () => {
    if (!newVoucher.code || !newVoucher.discountAmount) {
      toast.error("Code and Discount Amount are required");
      return;
    }

    try {
      await api.post("/admin/promotions", {
        code: newVoucher.code.toUpperCase(),
        discountAmount: Number(newVoucher.discountAmount),
        minSpend: Number(newVoucher.minSpend) || 0,
        isActive: true,
        discountType: "FIXED", // Defaulting to FIXED for now
        discountValue: Number(newVoucher.discountAmount), // Backend expects this
      });
      loadVouchers();
      setIsAdding(false);
      setNewVoucher({});
      toast.success("Voucher created successfully");
    } catch (error) {
      console.error("Failed to add voucher", error);
      toast.error("Failed to add voucher");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this voucher?")) {
      try {
        await api.delete(`/admin/promotions/${id}`);
        loadVouchers();
        toast.success("Voucher deleted");
      } catch (error) {
        console.error("Failed to delete voucher", error);
        toast.error("Failed to delete voucher");
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    const voucher = vouchers.find((v) => v.id === id);
    if (!voucher) return;

    try {
      await api.put(`/admin/promotions/${id}`, { isActive: !voucher.isActive });
      loadVouchers();
    } catch (error) {
      console.error("Failed to update voucher", error);
      toast.error("Failed to update voucher");
    }
  };

  if (loading || !isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Promotions
            </h1>
            <p className="text-muted-foreground">
              Manage platform-wide vouchers and discounts.
            </p>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 mr-2" /> Create Voucher
          </Button>
        </div>

        {isAdding && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>New Voucher</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Voucher Code</Label>
                  <Input
                    value={newVoucher.code || ""}
                    onChange={(e) =>
                      setNewVoucher({ ...newVoucher, code: e.target.value })
                    }
                    placeholder="e.g. SAVE10"
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Amount (Rp)</Label>
                  <Input
                    type="number"
                    value={newVoucher.discountAmount || ""}
                    onChange={(e) =>
                      setNewVoucher({
                        ...newVoucher,
                        discountAmount: Number(e.target.value),
                      })
                    }
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min. Spend (Rp)</Label>
                  <Input
                    type="number"
                    value={newVoucher.minSpend || ""}
                    onChange={(e) =>
                      setNewVoucher({
                        ...newVoucher,
                        minSpend: Number(e.target.value),
                      })
                    }
                    placeholder="50000"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd}>Save Voucher</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {vouchers.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No vouchers created yet.</p>
            </div>
          ) : (
            vouchers.map((voucher) => (
              <Card
                key={voucher.id}
                className={!voucher.isActive ? "opacity-60" : ""}
              >
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Ticket className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{voucher.code}</h3>
                      <p className="text-muted-foreground">
                        Discount: Rp {voucher.discountAmount.toLocaleString()} •
                        Min. Spend: Rp {voucher.minSpend.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={voucher.isActive ? "default" : "secondary"}
                      size="sm"
                      onClick={() => handleToggleActive(voucher.id)}
                    >
                      {voucher.isActive ? "Active" : "Inactive"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(voucher.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
