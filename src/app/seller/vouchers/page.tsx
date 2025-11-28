"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Ticket } from "lucide-react";
import { format } from "date-fns";

interface Voucher {
  id: string;
  code: string;
  discountType: "FIXED" | "PERCENT";
  discountValue: number;
  minPurchase: number;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
}

export default function SellerVouchersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discountType: "FIXED",
    discountValue: "",
    minPurchase: "",
    maxUses: "",
    expiresAt: "",
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "SELLER")) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && user?.role === "SELLER") {
      fetchVouchers();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/vouchers");
      setVouchers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch vouchers", error);
      toast.error("Failed to load vouchers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/vouchers", {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minPurchase: parseFloat(formData.minPurchase),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      });
      toast.success("Voucher created successfully");
      setIsDialogOpen(false);
      fetchVouchers();
      setFormData({
        code: "",
        discountType: "FIXED",
        discountValue: "",
        minPurchase: "",
        maxUses: "",
        expiresAt: "",
      });
    } catch (error: any) {
      console.error("Failed to create voucher", error);
      toast.error(error.response?.data?.message || "Failed to create voucher");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;
    try {
      await api.delete(`/vouchers/${id}`);
      toast.success("Voucher deleted");
      fetchVouchers();
    } catch (error) {
      console.error("Failed to delete voucher", error);
      toast.error("Failed to delete voucher");
    }
  };

  if (authLoading || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="h-8 w-8" /> Vouchers & Promotions
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Create Voucher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Voucher</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Voucher Code</Label>
                  <Input
                    placeholder="e.g. SALE10"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, discountType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED">Fixed Amount (Rp)</SelectItem>
                        <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      placeholder={
                        formData.discountType === "FIXED" ? "10000" : "10"
                      }
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Purchase (Rp)</Label>
                  <Input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) =>
                      setFormData({ ...formData, minPurchase: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Uses (Optional)</Label>
                    <Input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) =>
                        setFormData({ ...formData, maxUses: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date (Optional)</Label>
                    <Input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData({ ...formData, expiresAt: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Voucher"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min. Purchase</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No active vouchers. Create one to start promoting!
                  </TableCell>
                </TableRow>
              ) : (
                vouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-bold">{voucher.code}</TableCell>
                    <TableCell>
                      {voucher.discountType === "FIXED"
                        ? new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(voucher.discountValue)
                        : `${voucher.discountValue}%`}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(voucher.minPurchase)}
                    </TableCell>
                    <TableCell>
                      {voucher.currentUses} / {voucher.maxUses || "∞"}
                    </TableCell>
                    <TableCell>
                      {voucher.expiresAt
                        ? format(new Date(voucher.expiresAt), "PPP")
                        : "No Expiry"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(voucher.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
