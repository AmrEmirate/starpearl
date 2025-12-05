"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatarUrl: string | null;
  };
}

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
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleToggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setShowComments(true);
    setLoadingComments(true);
    try {
      const res = await api.get(`/community/${post.id}/comments`);
      setComments(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.post(`/community/${post.id}/comment`, { content: newComment });
      setNewComment("");
      // Refresh comments
      const res = await api.get(`/community/${post.id}/comments`);
      setComments(res.data.data || []);
      onUpdate(); // Refresh post count
      toast.success("Comment added!");
    } catch (error) {
      console.error("Failed to add comment", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
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
          variant={showComments ? "secondary" : "ghost"}
          size="sm"
          className="flex items-center gap-2 text-muted-foreground"
          onClick={handleToggleComments}
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

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-border">
          {/* Comment Input */}
          {user && (
            <div className="flex gap-2 mt-3 mb-4">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                disabled={submitting}
              />
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <p className="text-sm text-muted-foreground py-2">
              Loading comments...
            </p>
          ) : comments.length > 0 ? (
            <div className="space-y-3 mt-2">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {comment.user.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              No comments yet. Be the first!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
