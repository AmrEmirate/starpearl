"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreStatus } from "@/types/enums"; // Kita akan buat file ini

// Tipe data untuk Seller (Toko) dari backend
interface SellerStore {
  id: string; // Store ID
  name: string; // Store Name
  status: StoreStatus;
  createdAt: string;
  user: {
    id: string; // User ID
    name: string;
    email: string;
  };
}

// Tipe data untuk Statistik (statis untuk saat ini)
interface Stat {
  label: string;
  value: string;
  icon: string;
}

const stats: Stat[] = [
  { label: "Total Users", value: "1,234", icon: "👥" },
  { label: "Total Sales", value: "$45,678", icon: "💰" },
  { label: "Active Sellers", value: "89", icon: "🏪" },
  { label: "Pending Orders", value: "23", icon: "📦" },
];

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [sellers, setSellers] = useState<SellerStore[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data sellers
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/sellers");
      setSellers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch sellers", error);
      toast.error("Failed to load seller data.");
    } finally {
      setLoading(false);
    }
  };

  // Pengecekan otentikasi
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.push("/login");
    }
    if (!authLoading && user?.role === "ADMIN") {
      fetchSellers(); // Muat data jika admin sudah login
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Fungsi untuk update status toko
  const handleUpdateStatus = async (storeId: string, status: StoreStatus) => {
    const promise = api.patch(`/admin/sellers/${storeId}/status`, { status });

    toast.promise(promise, {
      loading: "Updating status...",
      success: () => {
        // Update state secara lokal agar UI responsif
        setSellers((prevSellers) =>
          prevSellers.map((seller) =>
            seller.id === storeId ? { ...seller, status: status } : seller
          )
        );
        return `Seller status updated to ${status}`;
      },
      error: (err) => {
        return err.response?.data?.message || "Failed to update status.";
      },
    });
  };

  // Tampilan loading halaman
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Tampilan jika bukan admin (sebagai fallback, meskipun sudah ada redirect)
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the Starpearl marketplace</p>
        </div>

        {/* Stats Grid (Masih statis) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <span className="text-2xl">{stat.icon}</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Seller Management Table */}
        <Card>
          <CardHeader>
            <CardTitle>Seller Management</CardTitle>
            <CardDescription>Approve or reject new seller applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Seller Email</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.length > 0 ? (
                  sellers.map((seller) => (
                    <TableRow key={seller.id}>
                      <TableCell className="font-medium">{seller.name}</TableCell>
                      <TableCell>{seller.user.email}</TableCell>
                      <TableCell>
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            seller.status === "APPROVED"
                              ? "default"
                              : seller.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            seller.status === "APPROVED" ? "bg-green-600" : ""
                          }
                        >
                          {seller.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {seller.status === "PENDING" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleUpdateStatus(seller.id, StoreStatus.APPROVED)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive hover:bg-destructive/5 hover:text-destructive/90"
                              onClick={() => handleUpdateStatus(seller.id, StoreStatus.REJECTED)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {seller.status === "APPROVED" && (
                           <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive hover:bg-destructive/5 hover:text-destructive/90"
                              onClick={() => handleUpdateStatus(seller.id, StoreStatus.SUSPENDED)}
                            >
                              Suspend
                            </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No sellers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}