"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X } from "lucide-react";

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export default function AdminCommunityPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && user?.role === "ADMIN") {
      fetchPendingPosts();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/posts/pending");
      setPosts(response.data.data);
    } catch (error) {
      console.error("Failed to fetch pending posts", error);
      toast.error("Failed to load pending posts");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId: string) => {
    try {
      await api.patch(`/admin/posts/${postId}/approve`);
      toast.success("Post approved successfully");
      fetchPendingPosts();
    } catch (error) {
      console.error("Failed to approve post", error);
      toast.error("Failed to approve post");
    }
  };

  const handleReject = async (postId: string) => {
    if (!confirm("Are you sure you want to reject this post?")) return;

    try {
      await api.patch(`/admin/posts/${postId}/reject`);
      toast.success("Post rejected successfully");
      fetchPendingPosts();
    } catch (error) {
      console.error("Failed to reject post", error);
      toast.error("Failed to reject post");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Community Moderation
            </h1>
            <p className="text-muted-foreground">
              Review pending posts from the community.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Back to Dashboard
          </Button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
            <p className="text-muted-foreground">
              There are no pending posts to review.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="bg-muted/30 flex flex-row items-start justify-between pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.user.avatarUrl || "/placeholder.svg"}
                      alt={post.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle className="text-base">
                        {post.user.name}
                      </CardTitle>
                      <CardDescription>
                        {post.user.email} •{" "}
                        {format(new Date(post.createdAt), "PPP p")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-foreground text-lg mb-4">{post.content}</p>

                  {post.imageUrl && (
                    <div className="rounded-lg overflow-hidden mb-6 bg-muted max-w-md">
                      <img
                        src={post.imageUrl}
                        alt="Post content"
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleReject(post.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(post.id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
