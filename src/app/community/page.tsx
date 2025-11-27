"use client"

import { useState, useEffect } from "react"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { api } from "@/services/api"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"

interface Post {
  id: string
  user: {
    name: string
    avatarUrl: string | null
  }
  content: string
  imageUrl: string | null
  _count: {
    likes: number
    comments: number
  }
  createdAt: string
}

export default function CommunityPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  const fetchPosts = async () => {
    try {
      const res = await api.get("/community")
      setPosts(res.data.data.posts)
    } catch (error) {
      console.error("Failed to fetch posts", error)
      toast.error("Failed to load community posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handlePostSubmit = async () => {
    if (!user) {
      toast.error("Please login to post")
      return
    }
    
    if (newPost.trim()) {
      setPosting(true)
      try {
        await api.post("/community", { content: newPost })
        setNewPost("")
        toast.success("Post created successfully! Waiting for approval.")
        fetchPosts() // Refresh posts
      } catch (error) {
        console.error("Failed to create post", error)
        toast.error("Failed to create post")
      } finally {
        setPosting(false)
      }
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error("Please login to like")
      return
    }
    try {
      await api.post(`/community/${postId}/like`)
      fetchPosts() // Refresh to show new like count
    } catch (error) {
      console.error("Failed to like post", error)
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
              src={user?.avatarUrl || "/placeholder.svg?height=48&width=48"}
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
              disabled={!newPost.trim() || posting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {posting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
               <div key={i} className="space-y-4">
                 <Skeleton className="h-12 w-12 rounded-full" />
                 <Skeleton className="h-4 w-[250px]" />
                 <Skeleton className="h-4 w-[200px]" />
               </div>
             ))
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center gap-3 border-b border-border">
                  <img
                    src={post.user.avatarUrl || "/placeholder.svg"}
                    alt={post.user.name || "User"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{post.user.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <p className="text-foreground mb-4">{post.content}</p>

                  {post.imageUrl && (
                    <div className="rounded-lg overflow-hidden mb-4 bg-muted">
                      <img src={post.imageUrl} alt="Post content" className="w-full h-auto" />
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
                    <span>{post._count.likes} likes</span>
                    <span>{post._count.comments} comments</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      onClick={() => handleLike(post.id)}
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
            ))
          ) : (
            <p className="text-center text-muted-foreground">No posts yet. Be the first to share!</p>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
