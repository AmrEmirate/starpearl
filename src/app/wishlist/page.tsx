"use client";

import { api } from "@/services/api";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Heart } from "lucide-react";
import Link from "next/link";

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: string;
    imageUrls: string[];
    stock: number;
    store: {
      name: string;
    };
  };
}

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get("/wishlist");
      setItems(response.data.data?.items || []);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Failed to remove item", error);
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await api.post("/cart", {
        productId,
        quantity: 1,
      });
      toast.success("Added to cart!");
    } catch (error: any) {
      console.error("Failed to add to cart", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Heart className="fill-red-500 text-red-500" /> My Wishlist
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            Your wishlist is empty.
          </p>
          <Button onClick={() => router.push("/browse")}>
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow"
            >
              <Link href={`/products/${item.productId}`}>
                <div className="h-48 bg-muted relative">
                  {item.product.imageUrls &&
                  item.product.imageUrls.length > 0 ? (
                    <img
                      src={item.product.imageUrls[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      📦
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-muted-foreground">
                    {item.product.store.name}
                  </span>
                </div>
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-1">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-xl font-bold text-primary mb-4">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(parseFloat(item.product.price))}
                </p>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleAddToCart(item.productId)}
                    disabled={item.product.stock <= 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {item.product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemove(item.productId)}
                    disabled={removingId === item.productId}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
