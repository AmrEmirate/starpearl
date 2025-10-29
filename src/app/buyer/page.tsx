"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function BuyerDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "buyer") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "buyer") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Orders", value: "12", icon: "📦" },
            { label: "Wishlist", value: "8", icon: "❤️" },
            { label: "Spent", value: "$2,345", icon: "💳" },
            { label: "Points", value: "450", icon: "⭐" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "My Orders", description: "Track your purchases", icon: "📋", href: "#" },
            { title: "Wishlist", description: "View saved items", icon: "❤️", href: "#" },
            { title: "Account Settings", description: "Manage your profile", icon: "⚙️", href: "#" },
            { title: "Browse Products", description: "Discover new accessories", icon: "🛍️", href: "/browse" },
          ].map((action) => (
            <Link key={action.title} href={action.href}>
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
                <div className="text-3xl mb-3">{action.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{action.title}</h3>
                <p className="text-muted-foreground text-sm">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {[
              { id: "#12345", product: "Gold Bracelet", date: "2 days ago", status: "Delivered" },
              { id: "#12344", product: "Pearl Necklace", date: "1 week ago", status: "Delivered" },
              { id: "#12343", product: "Crystal Ring", date: "2 weeks ago", status: "Delivered" },
            ].map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
              >
                <div>
                  <p className="font-semibold text-foreground">{order.product}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.id} • {order.date}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 text-sm font-semibold rounded-full">
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
