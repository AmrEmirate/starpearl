"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Order {
  id: string;
  createdAt: string;
  status: string;
  items: {
    product: {
      name: string;
    };
  }[];
}

export default function BuyerDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "BUYER")) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && user?.role === "BUYER") {
      fetchRecentOrders();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get("/orders");
      // Ambil 3 order terbaru
      setRecentOrders(response.data.data.slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch recent orders", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "BUYER") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Orders",
              value: recentOrders.length.toString(),
              icon: "📦",
            },
            { label: "Wishlist", value: "0", icon: "❤️" }, // Placeholder
            { label: "Points", value: "0", icon: "⭐" }, // Placeholder
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "My Orders",
              description: "Track your purchases",
              icon: "📋",
              href: "/orders",
            },
            {
              title: "Wishlist",
              description: "View saved items",
              icon: "❤️",
              href: "#",
            },
            {
              title: "Account Settings",
              description: "Manage your profile",
              icon: "⚙️",
              href: "#",
            },
            {
              title: "Browse Products",
              description: "Discover new accessories",
              icon: "🛍️",
              href: "/browse",
            },
          ].map((action) => (
            <Link key={action.title} href={action.href}>
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
                <div className="text-3xl mb-3">{action.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {action.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Recent Orders
            </h2>
            <Link href="/orders">
              <span className="text-sm text-primary hover:underline cursor-pointer">
                View All
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent orders.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {order.items[0]?.product.name}
                      {order.items.length > 1 &&
                        ` + ${order.items.length - 1} more`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.id.slice(0, 8)} •{" "}
                      {format(new Date(order.createdAt), "PPP")}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      order.status === "COMPLETED"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-yellow-500/10 text-yellow-600"
                    }`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
