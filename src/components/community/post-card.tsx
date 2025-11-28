"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

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

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like");
      return;
    }
    if (liking) return;

    setLiking(true);
    try {
      await api.post(`/community/${post.id}/like`);
      onUpdate();
    } catch (error) {
      console.error("Failed to like post", error);
    } finally {
      setLiking(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={post.user.avatarUrl || undefined} />
          <AvatarFallback>{post.user.name?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm text-foreground">
            {post.user.name || "Anonymous"}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.imageUrl && (
        <div className="px-4 pb-4">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full h-auto rounded-lg object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 ${
            post.isLiked
              ? "text-red-500 hover:text-red-600"
              : "text-muted-foreground"
          }`}
          onClick={handleLike}
          disabled={liking}
        >
          <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
          <span>{post._count.likes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post._count.comments}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
