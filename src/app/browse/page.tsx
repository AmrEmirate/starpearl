"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const categories = ["All", "Bracelets", "Necklaces", "Rings", "Earrings", "Anklets"]
const priceRanges = ["Under Rp 50K", "Rp 50K - 100K", "Rp 100K - 200K", "Over Rp 200K"]

const allProducts = [
  {
    id: 1,
    name: "Minimalist Pearl Bracelet",
    price: "Rp 89.000",
    image: "/pearl-bracelet.jpg",
    rating: 4.8,
    reviews: 124,
    seller: "Pearl Dreams",
    category: "Bracelets",
  },
  {
    id: 2,
    name: "Colorful Beaded Necklace",
    price: "Rp 125.000",
    image: "/beaded-necklace.jpg",
    rating: 4.9,
    reviews: 89,
    seller: "Bead Studio",
    category: "Necklaces",
  },
  {
    id: 3,
    name: "Gold Ring Set",
    price: "Rp 156.000",
    image: "/gold-rings.jpg",
    rating: 4.7,
    reviews: 156,
    seller: "Golden Touch",
    category: "Rings",
  },
  {
    id: 4,
    name: "Vintage Chain Bracelet",
    price: "Rp 98.000",
    image: "/vintage-chain.jpg",
    rating: 4.6,
    reviews: 92,
    seller: "Vintage Vibes",
    category: "Bracelets",
  },
  {
    id: 5,
    name: "Crystal Earrings",
    price: "Rp 75.000",
    image: "/crystal-earrings.jpg",
    rating: 4.9,
    reviews: 203,
    seller: "Crystal Gems",
    category: "Earrings",
  },
  {
    id: 6,
    name: "Layered Gold Necklace",
    price: "Rp 145.000",
    image: "/layered-gold-necklace.jpg",
    rating: 4.8,
    reviews: 167,
    seller: "Golden Touch",
    category: "Necklaces",
  },
  {
    id: 7,
    name: "Beaded Ankle Bracelet",
    price: "Rp 65.000",
    image: "/beaded-anklet.jpg",
    rating: 4.7,
    reviews: 78,
    seller: "Bead Studio",
    category: "Anklets",
  },
  {
    id: 8,
    name: "Minimalist Ring Stack",
    price: "Rp 120.000",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 145,
    seller: "Minimal Designs",
    category: "Rings",
  },
]

export default function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Browse Accessories</h1>
          <p className="text-muted-foreground">Discover unique pieces from talented creators</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1 flex items-center bg-card border border-border rounded-lg px-4 py-3">
            <input
              type="text"
              placeholder="Search accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="border-border">
            {showFilters ? "✕" : "⚙️"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block lg:col-span-1`}>
            <div className="bg-card rounded-lg p-6 border border-border space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-foreground">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Rating</h3>
                <div className="space-y-2">
                  {[5, 4, 3].map((stars) => (
                    <label key={stars} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <div className="flex items-center gap-1">
                        {[...Array(stars)].map((_, i) => (
                          <span key={i} className="text-lg">
                            ★
                          </span>
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-2xl bg-muted mb-4 aspect-square">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button size="icon" className="bg-white hover:bg-white/90 text-foreground rounded-full">
                          ❤️
                        </Button>
                        <Button
                          size="icon"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                        >
                          🛒
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{product.seller}</p>

                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${i < Math.floor(product.rating) ? "text-primary" : "text-muted"}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>

                      <p className="text-lg font-bold text-primary">{product.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
