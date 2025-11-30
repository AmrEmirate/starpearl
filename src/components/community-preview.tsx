"use client";

import { api } from "@/services/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
  };
  user: {
    name: string;
  };
}

export function CommunityPreview() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/community?limit=3");
        setPosts(response.data.data.posts || []);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Community Stories
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Join thousands of shoppers sharing their experiences and
            discoveries. Be part of our growing community.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-2" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </Card>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(post.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      {post.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getTimeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>

                <p className="text-foreground mb-4 leading-relaxed line-clamp-3">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <span className="text-lg">❤️</span>
                    <span className="text-sm">{post._count.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <span className="text-lg">💬</span>
                    <span className="text-sm">{post._count.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <span className="text-lg">↗️</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No community posts yet. Be the first to share your story!
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/community">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Join the Community
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
