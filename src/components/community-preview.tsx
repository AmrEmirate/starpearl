"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const posts = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "SC",
    content: "Just received my new headphones and they sound amazing! The quality is incredible for the price.",
    likes: 234,
    comments: 45,
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    author: "Marcus Johnson",
    avatar: "MJ",
    content: "Anyone else love the minimalist aesthetic? This watch has been my daily driver for 6 months now.",
    likes: 512,
    comments: 89,
    timestamp: "4 hours ago",
  },
  {
    id: 3,
    author: "Emma Rodriguez",
    avatar: "ER",
    content: "The community here is so supportive! Found amazing recommendations for my next purchase.",
    likes: 189,
    comments: 32,
    timestamp: "6 hours ago",
  },
]

export function CommunityPreview() {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Community Stories</h2>
          <p className="text-muted-foreground max-w-2xl">
            Join thousands of shoppers sharing their experiences and discoveries. Be part of our growing community.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">{post.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{post.author}</p>
                  <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                </div>
              </div>

              <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <span className="text-lg">❤️</span>
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <span className="text-lg">💬</span>
                  <span className="text-sm">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <span className="text-lg">↗️</span>
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Join the Community
          </Button>
        </div>
      </div>
    </section>
  )
}
