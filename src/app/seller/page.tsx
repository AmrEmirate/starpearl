"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SellerDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "SELLER")) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router, loading]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated || user?.role !== "SELLER") return;
      try {
        const { api } = require("@/services/api"); // Lazy load to avoid circular deps if any
        const response = await api.get("/stores/dashboard/stats");
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "SELLER") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Seller Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your shop and products</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Revenue",
              value: new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(stats.totalRevenue),
              icon: "💰",
            },
            { label: "Total Products", value: stats.totalProducts, icon: "📦" },
            { label: "Total Orders", value: stats.totalOrders, icon: "📋" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {loadingStats ? "..." : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "My Products",
              description: "Add, edit, and manage your products",
              icon: "📦",
              href: "/seller/products",
            },
            {
              title: "Orders",
              description: "View and manage customer orders",
              icon: "📋",
              href: "/seller/orders",
            },
            {
              title: "Shop Settings",
              description: "Customize your shop profile",
              icon: "🏪",
              href: "/seller/settings",
            },
            {
              title: "Analytics",
              description: "View sales and performance metrics",
              icon: "📊",
              href: "#",
            },
          ].map((section) => (
            <div
              key={section.title}
              className="bg-card border border-border rounded-lg p-6 flex flex-col h-full"
            >
              <div className="text-3xl mb-3">{section.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {section.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 flex-grow">
                {section.description}
              </p>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() =>
                  section.href !== "#" && router.push(section.href)
                }
              >
                Manage
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
