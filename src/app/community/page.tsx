"use client";

import { useState, useEffect } from "react";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/community/post-card";
import { CreatePostModal } from "@/components/community/create-post-modal";
import { Plus } from "lucide-react";

interface Post {
  id: string;
  user: {
    name: string;
    avatarUrl: string | null;
  };
  content: string;
  imageUrl: string | null;
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
  createdAt: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/community");
      setPosts(res.data.data.posts);
    } catch (error) {
      console.error("Failed to fetch posts", error);
      toast.error("Failed to load community posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]); // Re-fetch when user changes (login/logout) to update like status

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Community
            </h1>
            <p className="text-muted-foreground">
              Share your style, get inspired, connect with creators
            </p>
          </div>
          {user && (
            <CreatePostModal onPostCreated={fetchPosts}>
              <Button className="hidden sm:flex gap-2">
                <Plus className="w-4 h-4" />
                Create Post
              </Button>
            </CreatePostModal>
          )}
        </div>

        {/* Mobile Create Post Button */}
        {user && (
          <div className="sm:hidden mb-6">
            <CreatePostModal onPostCreated={fetchPosts}>
              <Button className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Create Post
              </Button>
            </CreatePostModal>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </div>
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No posts yet. Be the first to share!
              </p>
              {user && (
                <CreatePostModal onPostCreated={fetchPosts}>
                  <Button variant="outline">Create Post</Button>
                </CreatePostModal>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
