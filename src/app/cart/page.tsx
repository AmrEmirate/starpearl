"use client";

import { useState, useEffect } from "react";

import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"; // Pastikan 'sonner' sudah di-import

// Tipe data untuk item di keranjang (dari backend)
interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    imageUrls: string[];
    price: number;
    stock: number;
    store: {
      name: string;
    };
  };
}

// Tipe data untuk keranjang
interface Cart {
  id: string | null;
  userId: string;
  items: CartItem[];
  total: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fungsi untuk mengambil data keranjang
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      setCart(response.data.data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
      toast.error("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  // Ambil data keranjang saat halaman dimuat
  useEffect(() => {
    fetchCart();
  }, []);

  // --- FUNGSI UPDATE KUANTITAS (DIPERBARUI) ---
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId); // Jika kuantitas 0 atau kurang, panggil fungsi hapus
      return;
    }

    // Tampilkan toast loading
    const promise = api.patch(`/cart/${itemId}`, { quantity: newQuantity });

    toast.promise(promise, {
      loading: "Updating quantity...",
      success: () => {
        fetchCart(); // Muat ulang data keranjang jika sukses
        return "Quantity updated!";
      },
      error: (err) => {
        return err.response?.data?.message || "Failed to update quantity.";
      },
    });
  };

  // --- FUNGSI HAPUS ITEM (DIPERBARUI) ---
  const removeItem = async (itemId: string) => {
    // Tampilkan toast loading
    const promise = api.delete(`/cart/${itemId}`);

    toast.promise(promise, {
      loading: "Removing item...",
      success: () => {
        fetchCart(); // Muat ulang data keranjang jika sukses
        return "Item removed from cart!";
      },
      error: (err) => {
        return err.response?.data?.message || "Failed to remove item.";
      },
    });
  };

  // --- Kalkulasi dari state 'cart' ---
  const subtotal = cart?.total || 0;
  // Sesuai blueprint [cite: 71-73], kita terapkan biaya layanan
  const serviceFee = subtotal < 50000 ? 0 : Math.ceil(subtotal / 100000) * 1000;
  const shipping = subtotal > 200000 ? 0 : 25000; // Contoh aturan ongkir
  const total = subtotal + shipping + serviceFee;

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">🛒</div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <Link href="/browse">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="p-4 flex gap-4">
              <img
                src={item.product.imageUrls[0] || "/placeholder.jpg"}
                alt={item.product.name}
                className="w-24 h-24 rounded-lg object-cover bg-muted"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {item.product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {item.product.store.name}
                </p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(item.product.price)}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)} // Panggil fungsi hapus
                  className="text-destructive hover:bg-destructive/10"
                >
                  🗑️
                </Button>

                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)} // Panggil fungsi update
                    className="px-4 py-2 text-foreground hover:bg-muted"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)} // Panggil fungsi update
                    disabled={item.quantity >= item.product.stock} // Disable jika stok tidak cukup
                    className="px-4 py-2 text-foreground hover:bg-muted"
                  >
                    +
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Order Summary</h2>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between text-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Shipping</span>
                <span
                  className={shipping === 0 ? "text-accent font-semibold" : ""}
                >
                  {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Service Fee</span>
                <span>{formatCurrency(serviceFee)}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-between text-lg font-bold text-foreground">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>

            <Link href="/checkout" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base">
                Proceed to Checkout
              </Button>
            </Link>

            <Link href="/browse" className="block">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent"
              >
                Continue Shopping
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}
