"use client";

import { api } from "@/services/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ShoppingCart, Star, Heart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  images: string[];
  store: {
    id: string;
    name: string;
  };
}

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, reviewsRes] = await Promise.all([
          api.get(`/products/${params.id}`),
          api.get(`/reviews/${params.id}`),
        ]);

        setProduct(productRes.data.data);
        setReviews(reviewsRes.data.data);

        // Check wishlist status if logged in
        if (isAuthenticated) {
          try {
            const wishlistRes = await api.get("/wishlist");
            const wishlistItems = wishlistRes.data.data?.items || [];
            const isInWishlist = wishlistItems.some(
              (item: any) => item.productId === params.id
            );
            setIsWishlisted(isInWishlist);
          } catch (error) {
            console.error("Failed to check wishlist status", error);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, isAuthenticated]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to use wishlist");
      router.push("/login");
      return;
    }

    setTogglingWishlist(true);
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product?.id}`);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await api.post("/wishlist", { productId: product?.id });
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
      toast.error("Failed to update wishlist");
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    setAddingToCart(true);
    try {
      await api.post("/cart", {
        productId: product?.id,
        quantity: 1,
      });
      toast.success("Added to cart successfully!");
    } catch (error: any) {
      console.error("Failed to add to cart", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${params.id}`, {
        rating,
        content: reviewContent,
      });
      toast.success("Review submitted successfully!");

      // Refresh reviews
      const reviewsRes = await api.get(`/reviews/${params.id}`);
      setReviews(reviewsRes.data.data);

      // Reset form
      setRating(5);
      setReviewContent("");
    } catch (error: any) {
      console.error("Failed to submit review", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-8 pl-0 hover:pl-2 transition-all"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="bg-muted rounded-lg overflow-hidden h-[400px] md:h-[500px] flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl">📦</span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-2">
              <span className="text-sm text-muted-foreground">
                Sold by {product.store.name}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-primary mb-6">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(parseFloat(product.price))}
            </p>

            <div className="prose prose-invert mb-8">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                size="lg"
                className="w-full md:w-auto text-lg px-8"
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {addingToCart
                  ? "Adding..."
                  : product.stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-4"
                onClick={handleToggleWishlist}
                disabled={togglingWishlist}
              >
                <Heart
                  className={`h-6 w-6 ${
                    isWishlisted ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
            </div>

            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-red-500 text-sm mt-4">
                Only {product.stock} left in stock!
              </p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

          {/* Review Form */}
          {isAuthenticated && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl focus:outline-none ${
                          star <= rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Review
                  </label>
                  <Textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="min-h-[100px]"
                  />
                </div>
                <Button type="submit" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-border pb-6 last:border-0"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <Avatar>
                      <AvatarImage src={review.user.avatarUrl || undefined} />
                      <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{review.user.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex text-yellow-400">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <span>•</span>
                        <span>{format(new Date(review.createdAt), "PPP")}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-foreground mt-2">{review.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
