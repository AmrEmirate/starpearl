"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const productDetails = {
  id: 1,
  name: "Minimalist Pearl Bracelet",
  price: "Rp 89.000",
  originalPrice: "Rp 120.000",
  rating: 4.8,
  reviews: 124,
  seller: "Pearl Dreams",
  sellerRating: 4.9,
  sellerReviews: 2341,
  description:
    "Elegant minimalist pearl bracelet handcrafted with premium quality pearls. Perfect for everyday wear or special occasions. Each piece is unique and carefully selected.",
  images: [
    "/pearl-bracelet-minimalist.jpg",
    "/placeholder.svg?height=500&width=500",
    "/placeholder.svg?height=500&width=500",
  ],
  specifications: {
    material: "Freshwater Pearl, Sterling Silver",
    length: "Adjustable 16-20cm",
    weight: "15g",
    care: "Avoid water and chemicals",
  },
  inStock: true,
  stock: 12,
}

const reviews = [
  {
    id: 1,
    author: "Rina Putri",
    rating: 5,
    date: "2 weeks ago",
    content: "Absolutely love this bracelet! The quality is amazing and it arrived quickly. Highly recommend!",
    helpful: 45,
  },
  {
    id: 2,
    author: "Dina Sari",
    rating: 4,
    date: "1 month ago",
    content: "Beautiful piece, though the clasp is a bit tight. Overall very satisfied with my purchase.",
    helpful: 23,
  },
]

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-muted aspect-square">
              <img
                src={productDetails.images[selectedImage] || "/placeholder.svg"}
                alt={productDetails.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {productDetails.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`rounded-lg overflow-hidden aspect-square border-2 transition ${
                    selectedImage === idx ? "border-primary" : "border-border"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`View ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{productDetails.name}</h1>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${i < Math.floor(productDetails.rating) ? "text-primary" : "text-muted"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {productDetails.rating} ({productDetails.reviews} reviews)
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={isWishlisted ? "text-accent" : "text-muted-foreground"}
                >
                  {isWishlisted ? "❤️" : "🤍"}
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">{productDetails.price}</span>
                <span className="text-lg text-muted-foreground line-through">{productDetails.originalPrice}</span>
              </div>
              <p className="text-sm text-accent font-semibold">Save Rp 31.000 (26%)</p>
            </div>

            {/* Seller Info */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{productDetails.seller}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-lg">★</span>
                    <span className="text-muted-foreground">
                      {productDetails.sellerRating} ({productDetails.sellerReviews} reviews)
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 bg-transparent">
                  Visit Store
                </Button>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Specifications</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(productDetails.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="text-foreground font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock & Quantity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Stock Available:</span>
                <span className={`font-semibold ${productDetails.inStock ? "text-accent" : "text-destructive"}`}>
                  {productDetails.inStock ? `${productDetails.stock} items` : "Out of Stock"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-foreground hover:bg-muted"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(productDetails.stock, quantity + 1))}
                    className="px-4 py-2 text-foreground hover:bg-muted"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base">
                🛒 Add to Cart
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/5 py-6 text-base bg-transparent"
              >
                ❤️ Wishlist
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center space-y-2">
                <div className="text-2xl">🚚</div>
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl">🔒</div>
                <p className="text-xs text-muted-foreground">Secure Payment</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl">↩️</div>
                <p className="text-xs text-muted-foreground">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Product</h2>
              <p className="text-foreground leading-relaxed">{productDetails.description}</p>
            </div>

            {/* Reviews */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{review.author}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-lg ${i < review.rating ? "text-primary" : "text-muted"}`}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-foreground text-sm">{review.content}</p>
                    <button className="text-xs text-muted-foreground hover:text-primary mt-2">
                      Helpful ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20 p-6">
              <h3 className="font-semibold text-foreground mb-3">Share This Product</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-primary text-primary hover:bg-primary/5 bg-transparent"
                >
                  ↗️
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Related Products</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Link key={i} href="#" className="flex gap-3 group">
                    <img
                      src={`/accessory-.jpg?height=80&width=80&query=accessory ${i}`}
                      alt="Related"
                      className="w-20 h-20 rounded-lg object-cover group-hover:opacity-80 transition"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition">
                        Related Item {i}
                      </p>
                      <p className="text-sm text-primary font-semibold">Rp 99.000</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
