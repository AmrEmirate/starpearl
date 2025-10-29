"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const userProfile = {
  name: "Sarah Chen",
  email: "sarah.chen@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "SC",
  joinDate: "January 2024",
  bio: "Fashion enthusiast and jewelry collector",
  address: "123 Main Street, New York, NY 10001",
}

const orders = [
  {
    id: "ORD-2025-001",
    date: "2025-01-15",
    total: 250000,
    status: "Delivered",
    items: 3,
  },
  {
    id: "ORD-2025-002",
    date: "2025-01-10",
    total: 125000,
    status: "In Transit",
    items: 1,
  },
  {
    id: "ORD-2025-003",
    date: "2025-01-05",
    total: 89000,
    status: "Delivered",
    items: 1,
  },
]

const wishlist = [
  {
    id: 1,
    name: "Vintage Chain Bracelet",
    price: 98000,
    image: "/vintage-chain-bracelet.jpg",
    rating: 4.6,
  },
  {
    id: 2,
    name: "Crystal Earrings",
    price: 75000,
    image: "/crystal-earrings.jpg",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Layered Gold Necklace",
    price: 145000,
    image: "/layered-gold-necklace.jpg",
    rating: 4.8,
  },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(userProfile)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {userProfile.avatar}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{userProfile.name}</h1>
              <p className="text-muted-foreground mb-2">Member since {userProfile.joinDate}</p>
              <p className="text-foreground">{userProfile.bio}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? "bg-primary hover:bg-primary/90" : "border-border bg-transparent"}
              >
                ⚙️ {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
              <Button
                variant="outline"
                className="border-border bg-transparent text-destructive hover:bg-destructive/10"
              >
                🚪 Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Total Orders</h3>
                  <div className="text-2xl">📦</div>
                </div>
                <p className="text-3xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground mt-2">Lifetime purchases</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Total Spent</h3>
                  <div className="text-2xl">💰</div>
                </div>
                <p className="text-3xl font-bold text-foreground">Rp 2.5M</p>
                <p className="text-sm text-muted-foreground mt-2">Across all purchases</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Wishlist Items</h3>
                  <div className="text-2xl">❤️</div>
                </div>
                <p className="text-3xl font-bold text-foreground">{wishlist.length}</p>
                <p className="text-sm text-muted-foreground mt-2">Saved for later</p>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Contact Information</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-foreground">
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✉️</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-foreground">{formData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📱</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-foreground">{formData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📍</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-foreground">{formData.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">Rp {order.total.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{order.items} item(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === "Delivered" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                      }`}
                    >
                      {order.status}
                    </span>
                    <Button variant="outline" size="sm" className="border-border bg-transparent">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden rounded-t-lg bg-muted aspect-square">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{item.name}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${i < Math.floor(item.rating) ? "text-primary" : "text-muted"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">Rp {item.price.toLocaleString()}</span>
                      <Button size="sm" variant="outline" className="border-border bg-transparent">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates about orders and promotions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Get SMS alerts for important updates</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-border bg-transparent">
                    Enable
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-destructive/20 bg-destructive/5">
              <h2 className="text-xl font-bold text-destructive mb-4">Danger Zone</h2>
              <p className="text-muted-foreground mb-4">
                Deleting your account is permanent and cannot be undone. All your data will be lost.
              </p>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
              >
                Delete Account
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </main>
  )
}
