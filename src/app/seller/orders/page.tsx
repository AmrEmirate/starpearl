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
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Package, CheckCircle, XCircle, Clock } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrls: string[];
  };
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  shippingResi?: string;
  items: OrderItem[];
  user: {
    name: string;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export default function SellerOrdersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");

  // Modal State for Shipping
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [resiInput, setResiInput] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "SELLER")) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && user?.role === "SELLER") {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/store-orders");
      setOrders(response.data.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Jika status SHIPPED, buka modal input resi
    if (newStatus === "SHIPPED") {
      setSelectedOrderId(orderId);
      setResiInput("");
      setIsShipModalOpen(true);
      return;
    }

    // Untuk status lain, langsung update
    await updateStatus(orderId, newStatus);
  };

  const updateStatus = async (
    orderId: string,
    status: string,
    resi?: string
  ) => {
    try {
      setProcessingId(orderId);
      await api.patch(`/orders/${orderId}/status`, {
        status,
        shippingResi: resi,
      });
      toast.success(`Order status updated to ${status}`);
      fetchOrders(); // Refresh list
      setIsShipModalOpen(false);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update order status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleShipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !resiInput) {
      toast.error("Please enter a tracking number");
      return;
    }
    updateStatus(selectedOrderId, "SHIPPED", resiInput);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "PROCESSED":
        return "bg-blue-500 hover:bg-blue-600";
      case "SHIPPED":
        return "bg-purple-500 hover:bg-purple-600";
      case "DELIVERED":
        return "bg-green-500 hover:bg-green-600";
      case "CANCELLED":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "ALL") return true;
    return order.status === activeTab;
  });

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Order Management
            </h1>
            <p className="text-muted-foreground">
              Track and manage your store orders efficiently.
            </p>
          </div>
        </div>

        <Tabs defaultValue="ALL" onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-muted">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="PROCESSED">Processed</TabsTrigger>
            <TabsTrigger value="SHIPPED">Shipped</TabsTrigger>
            <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
            <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground">
              There are no orders in this category yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {format(new Date(order.createdAt), "PPP p")}
                      </CardDescription>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {order.status === "SHIPPED" && order.shippingResi && (
                        <div className="text-sm bg-background px-3 py-1 rounded border">
                          <span className="text-muted-foreground mr-2">
                            Resi:
                          </span>
                          <span className="font-mono font-medium">
                            {order.shippingResi}
                          </span>
                        </div>
                      )}

                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) =>
                          handleStatusChange(order.id, value)
                        }
                        disabled={processingId === order.id}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PROCESSED">Processed</SelectItem>
                          <SelectItem value="SHIPPED">Shipped</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Items Section */}
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" /> Order Items
                      </h3>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 p-3 bg-muted/20 rounded-lg"
                          >
                            <div className="h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                              {item.product.imageUrls &&
                              item.product.imageUrls.length > 0 ? (
                                <img
                                  src={item.product.imageUrls[0]}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xl">
                                  🛍️
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.quantity} x{" "}
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                }).format(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="space-y-6 border-l pl-0 md:pl-6">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-3">
                          <Truck className="w-4 h-4" /> Shipping Details
                        </h3>
                        <div className="text-sm space-y-2">
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-muted-foreground">
                            {order.shippingAddress.street}
                          </p>
                          <p className="text-muted-foreground">
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}{" "}
                            {order.shippingAddress.postalCode}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Payment Summary</h3>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-bold text-lg text-primary">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Shipping Modal */}
        {isShipModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md border">
              <h2 className="text-xl font-bold mb-4">Ship Order</h2>
              <p className="text-muted-foreground mb-4">
                Please enter the tracking number (Resi) for this order.
              </p>
              <form onSubmit={handleShipSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resi">Tracking Number (Resi)</Label>
                    <Input
                      id="resi"
                      value={resiInput}
                      onChange={(e) => setResiInput(e.target.value)}
                      placeholder="e.g. JNE123456789"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsShipModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Confirm Shipment</Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
