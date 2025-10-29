"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function SellerDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "seller") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "seller") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your shop and products</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Sales", value: "$12,345", icon: "💰" },
            { label: "Products", value: "45", icon: "📦" },
            { label: "Orders", value: "128", icon: "📋" },
            { label: "Rating", value: "4.8★", icon: "⭐" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "My Products", description: "Add, edit, and manage your products", icon: "📦" },
            { title: "Orders", description: "View and manage customer orders", icon: "📋" },
            { title: "Shop Settings", description: "Customize your shop profile", icon: "🏪" },
            { title: "Analytics", description: "View sales and performance metrics", icon: "📊" },
          ].map((section) => (
            <div key={section.title} className="bg-card border border-border rounded-lg p-6">
              <div className="text-3xl mb-3">{section.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{section.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{section.description}</p>
              <Button variant="outline" className="w-full bg-transparent">
                Manage
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
