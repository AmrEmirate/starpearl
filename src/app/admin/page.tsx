"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    pendingApprovals: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router, loading]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated || user?.role !== "ADMIN") return;
      try {
        const { api } = require("@/services/api");
        const response = await api.get("/admin/stats");
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
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

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Platform Overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: "👥" },
            { label: "Total Stores", value: stats.totalStores, icon: "🏪" },
            {
              label: "Pending Approvals",
              value: stats.pendingApprovals,
              icon: "⏳",
            },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-3">🏪</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Store Management
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Review pending store applications and manage existing stores.
            </p>
            <Link href="/admin/stores">
              <Button variant="outline" className="w-full">
                Manage Stores
              </Button>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Service Fees
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Configure platform service fee thresholds and amounts.
            </p>
            <Link href="/admin/fees">
              <Button variant="outline" className="w-full">
                Manage Fees
              </Button>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Content & Banners
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Update homepage banners and featured content.
            </p>
            <Link href="/admin/content">
              <Button variant="outline" className="w-full">
                Manage Content
              </Button>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-3">🎫</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Promotions
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create platform-wide vouchers and discounts.
            </p>
            <Link href="/admin/promotions">
              <Button variant="outline" className="w-full">
                Manage Vouchers
              </Button>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Reports & Analytics
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              View sales trends, revenue, and user growth.
            </p>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full">
                View Reports
              </Button>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-3">⚖️</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Dispute Resolution
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Handle refunds and buyer-seller conflicts.
            </p>
            <Link href="/admin/disputes">
              <Button variant="outline" className="w-full">
                Manage Disputes
              </Button>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Community Moderation
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Review and approve pending community posts.
            </p>
            <Link href="/admin/community">
              <Button variant="outline" className="w-full">
                Moderate Posts
              </Button>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              User Management
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Manage user accounts and permissions.
            </p>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full">
                Manage Users
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
