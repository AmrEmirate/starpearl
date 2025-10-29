"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: "$199",
    rating: 4.8,
    reviews: 324,
    image: "bg-gradient-to-br from-blue-400 to-blue-600",
  },
  {
    id: 2,
    name: "Minimalist Watch",
    price: "$149",
    rating: 4.9,
    reviews: 512,
    image: "bg-gradient-to-br from-purple-400 to-purple-600",
  },
  {
    id: 3,
    name: "Leather Backpack",
    price: "$129",
    rating: 4.7,
    reviews: 287,
    image: "bg-gradient-to-br from-amber-400 to-amber-600",
  },
  {
    id: 4,
    name: "Smart Water Bottle",
    price: "$89",
    rating: 4.6,
    reviews: 156,
    image: "bg-gradient-to-br from-cyan-400 to-cyan-600",
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Products</h2>
          <p className="text-muted-foreground max-w-2xl">
            Handpicked selections from our community of trusted sellers. Discover quality products at great prices.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-48 ${product.image} relative flex items-center justify-center`}>
                <Button size="icon" variant="secondary" className="absolute top-3 right-3 rounded-full">
                  🛒
                </Button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex items-center">
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
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">{product.price}</span>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
