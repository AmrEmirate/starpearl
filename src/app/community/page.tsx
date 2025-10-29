"use client"

import { useState } from "react"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

const communityPosts = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "/avatar-girl.jpg",
    content: "OOTD with my new pearl collection! 💕 Loving how these pieces complement each other.",
    image: "/fashion-ootd-accessories.jpg",
    likes: 1240,
    comments: 89,
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    author: "Maya Studios",
    avatar: "/avatar-creator.jpg",
    content: "Behind the scenes: Making custom beaded bracelets 🎨 Each piece takes about 2 hours to create!",
    image: "/beaded-bracelet-making-process.jpg",
    likes: 856,
    comments: 124,
    timestamp: "4 hours ago",
  },
  {
    id: 3,
    author: "Zara Style",
    avatar: "/avatar-fashion.jpg",
    content: "Mix & match guide: 5 ways to style your rings ✨ Which combination is your favorite?",
    image: "/ring-styling-guide-fashion.jpg",
    likes: 2103,
    comments: 267,
    timestamp: "6 hours ago",
  },
]

export default function CommunityPage() {
  const [posts, setPosts] = useState(communityPosts)
  const [newPost, setNewPost] = useState("")

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        author: "You",
        avatar: "/placeholder.svg?height=48&width=48",
        content: newPost,
        image: "",
        likes: 0,
        comments: 0,
        timestamp: "just now",
      }
      setPosts([post, ...posts])
      setNewPost("")
    }
  }

  return (
    <main className="min-h-screen bg-background">

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Community</h1>
          <p className="text-muted-foreground">Share your style, get inspired, connect with creators</p>
        </div>

        {/* Create Post */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <img
              src="/placeholder.svg?height=48&width=48"
              alt="Your avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your style inspiration..."
                className="w-full bg-muted rounded-lg p-4 text-foreground placeholder-muted-foreground outline-none resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                🖼️
              </Button>
            </div>
            <Button
              onClick={handlePostSubmit}
              disabled={!newPost.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              Post
            </Button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3 border-b border-border">
                <img
                  src={post.avatar || "/placeholder.svg"}
                  alt={post.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{post.author}</p>
                  <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                <p className="text-foreground mb-4">{post.content}</p>

                {post.image && (
                  <div className="rounded-lg overflow-hidden mb-4 bg-muted">
                    <img src={post.image || "/placeholder.svg"} alt={post.content} className="w-full h-auto" />
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
                  <span>{post.likes.toLocaleString()} likes</span>
                  <span>{post.comments} comments</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/5"
                  >
                    ❤️ Like
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/5"
                  >
                    💬 Comment
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/5"
                  >
                    ↗️ Share
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
