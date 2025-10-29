"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const cartItems = [
  {
    id: 1,
    name: "Minimalist Pearl Bracelet",
    price: 89000,
    quantity: 1,
    image: "/pearl-bracelet.jpg",
  },
  {
    id: 2,
    name: "Colorful Beaded Necklace",
    price: 125000,
    quantity: 2,
    image: "/beaded-necklace.jpg",
  },
  {
    id: 3,
    name: "Gold Ring Set",
    price: 156000,
    quantity: 1,
    image: "/gold-rings.jpg",
  },
]

export default function CheckoutPage() {
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 25000
  const tax = Math.round(subtotal * 0.1)
  const total = subtotal + shipping + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("payment")
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("confirmation")
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/cart" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
            ← Back to Cart
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex gap-4">
          {["shipping", "payment", "confirmation"].map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : ["shipping", "payment"].includes(s) && step === "confirmation"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step === "confirmation" && ["shipping", "payment"].includes(s) ? "✓" : idx + 1}
              </div>
              <span className="text-sm font-medium text-foreground capitalize hidden sm:inline">{s}</span>
              {idx < 2 && <div className="w-8 h-0.5 bg-border hidden sm:block" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "shipping" && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Shipping Information</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-foreground">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-foreground">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-foreground">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      required
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
                      placeholder="123 Main Street"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-foreground">
                        City
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-foreground">
                        State
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="NY"
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zipCode" className="text-foreground">
                      ZIP Code
                    </Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {step === "payment" && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Payment Information</h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="cardName" className="text-foreground">
                      Cardholder Name
                    </Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-foreground">
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate" className="text-foreground">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-foreground">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("shipping")}
                      className="flex-1 border-border"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                    >
                      Place Order
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {step === "confirmation" && (
              <Card className="p-6 text-center">
                <div className="mb-6">
                  <div className="text-6xl mb-4">✓</div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h2>
                  <p className="text-muted-foreground">
                    Thank you for your purchase. Your order has been placed successfully.
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-muted-foreground mb-2">Order Number</p>
                  <p className="text-2xl font-bold text-foreground">#ORD-2025-001234</p>
                </div>

                <p className="text-muted-foreground mb-6">
                  A confirmation email has been sent to{" "}
                  <span className="font-semibold text-foreground">{formData.email}</span>
                </p>

                <div className="flex gap-4">
                  <Link href="/browse" className="flex-1">
                    <Button variant="outline" className="w-full border-border bg-transparent">
                      Continue Shopping
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20 space-y-4">
              <h2 className="text-xl font-bold text-foreground">Order Summary</h2>

              <div className="space-y-3 border-t border-border pt-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-16 h-16 rounded object-cover bg-muted"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Shipping</span>
                  <span>Rp {shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Tax</span>
                  <span>Rp {tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between text-lg font-bold text-foreground">
                <span>Total</span>
                <span className="text-primary">Rp {total.toLocaleString()}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
