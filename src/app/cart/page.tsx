"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

const initialCartItems = [
  {
    id: 1,
    name: "Minimalist Pearl Bracelet",
    price: 89000,
    quantity: 1,
    image: "/pearl-bracelet.jpg",
    seller: "Pearl Dreams",
  },
  {
    id: 2,
    name: "Colorful Beaded Necklace",
    price: 125000,
    quantity: 2,
    image: "/beaded-necklace.jpg",
    seller: "Bead Studio",
  },
  {
    id: 3,
    name: "Gold Ring Set",
    price: 156000,
    quantity: 1,
    image: "/gold-rings.jpg",
    seller: "Golden Touch",
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 200000 ? 0 : 25000
  const tax = Math.round(subtotal * 0.1)
  const total = subtotal + shipping + tax

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">{cartItems.length} items in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">🛒</div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
            <Link href="/browse">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4 flex gap-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-24 h-24 rounded-lg object-cover bg-muted"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.seller}</p>
                    <p className="text-lg font-bold text-primary">Rp {item.price.toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      🗑️
                    </Button>

                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-4 py-2 text-foreground hover:bg-muted"
                      >
                        −
                      </button>
                      <span className="px-6 py-2 text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                    <span>Rp {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-accent font-semibold" : ""}>
                      {shipping === 0 ? "FREE" : `Rp ${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Tax (10%)</span>
                    <span>Rp {tax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">Rp {total.toLocaleString()}</span>
                </div>

                <Link href="/checkout" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link href="/browse" className="block">
                  <Button variant="outline" className="w-full border-border bg-transparent">
                    Continue Shopping
                  </Button>
                </Link>

                {subtotal <= 200000 && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-sm text-foreground">
                    <p className="font-semibold mb-1">Free Shipping Available!</p>
                    <p className="text-muted-foreground">
                      Add Rp {(200000 - subtotal).toLocaleString()} more to get free shipping
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
