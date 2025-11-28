"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface SubmitReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
  isLoading: boolean;
  onSubmit: (rating: number, content: string) => void;
}

export function SubmitReviewForm({
  productId,
  onReviewSubmitted,
  isLoading,
  onSubmit,
}: SubmitReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      return;
    }
    onSubmit(rating, content);
  };

  const handleReset = () => {
    setRating(0);
    setContent("");
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl">Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Your Rating <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} star{rating > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <label
              htmlFor="review-content"
              className="text-sm font-medium text-foreground"
            >
              Your Review (Optional)
            </label>
            <Textarea
              id="review-content"
              placeholder="Share your experience with this product..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={rating === 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
