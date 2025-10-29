"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the Starpearl marketplace</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: "1,234", icon: "👥" },
            { label: "Total Sales", value: "$45,678", icon: "💰" },
            { label: "Active Sellers", value: "89", icon: "🏪" },
            { label: "Pending Orders", value: "23", icon: "📦" },
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
            { title: "Users Management", description: "Manage users and permissions", icon: "👥" },
            { title: "Products Management", description: "Review and manage products", icon: "📦" },
            { title: "Orders Management", description: "Track and manage orders", icon: "📋" },
            { title: "Reports & Analytics", description: "View marketplace analytics", icon: "📊" },
          ].map((section) => (
            <div key={section.title} className="bg-card border border-border rounded-lg p-6">
              <div className="text-3xl mb-3">{section.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{section.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{section.description}</p>
              <Button variant="outline" className="w-full bg-transparent">
                Access
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
