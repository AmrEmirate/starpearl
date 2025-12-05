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
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      setOrders(response.data.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceived = async (orderId: string) => {
    setConfirmingOrderId(orderId);
    try {
      await api.patch(`/orders/${orderId}/confirm-received`);
      toast.success("Order confirmed as received!");
      fetchOrders(); // Refresh orders
    } catch (error: any) {
      console.error("Failed to confirm order", error);
      toast.error(error.response?.data?.message || "Failed to confirm order");
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-600";
      case "SHIPPED":
        return "bg-blue-600";
      case "PROCESSING":
        return "bg-yellow-600";
      case "PENDING_PAYMENT":
        return "bg-orange-500";
      case "CANCELLED":
        return "bg-red-600";
      default:
        return "";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Orders
            </h1>
            <p className="text-muted-foreground">
              View and track your past purchases
            </p>
          </div>
          <Link href="/browse">
            <Button>Continue Shopping</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet.
            </p>
            <Link href="/browse">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 flex flex-row items-center justify-between py-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      Placed on {format(new Date(order.createdAt), "PPP")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="font-bold text-lg">
                        Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className={getStatusColor(order.status)}
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-2xl">
                            {/* Placeholder for image if not available */}
                            🛍️
                          </div>
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">
                          Rp {Number(item.price).toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Received Button - Only show for SHIPPED orders */}
                  {order.status === "SHIPPED" && (
                    <div className="mt-6 pt-4 border-t">
                      <Button
                        onClick={() => handleConfirmReceived(order.id)}
                        disabled={confirmingOrderId === order.id}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {confirmingOrderId === order.id
                          ? "Confirming..."
                          : "Order Received"}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Click to confirm you have received this order
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
