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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrls: string[];
  isActive: boolean;
}

export default function MyProductsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "SELLER")) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && user?.role === "SELLER") {
      fetchProducts();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products/my-products");
      setProducts(response.data.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error("Failed to delete product");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Products
            </h1>
            <p className="text-muted-foreground">
              Manage your product inventory
            </p>
          </div>
          <Link href="/seller/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-xl font-semibold mb-2">No products yet</h2>
            <p className="text-muted-foreground mb-6">
              Start selling by adding your first product.
            </p>
            <Link href="/seller/products/new">
              <Button>Add Product</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative bg-muted">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-4xl">
                      🛍️
                    </div>
                  )}
                  {!product.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Inactive</Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate pr-2">
                      {product.name}
                    </CardTitle>
                    <Badge variant="outline">Stock: {product.stock}</Badge>
                  </div>
                  <CardDescription>
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() =>
                        router.push(`/seller/products/${product.id}/edit`)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
