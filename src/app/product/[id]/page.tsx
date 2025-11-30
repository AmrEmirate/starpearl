"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { SubmitReviewForm } from "@/components/product/submit-review-form";

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrls: string[];
  stock: number;
  store: {
    id: string;
    name: string;
  };
}

interface Review {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.data);
      } catch (err: any) {
        console.error("Failed to fetch product", err);
        if (err.response && err.response.status === 404) {
          setError("Product not found.");
        } else {
          setError("Failed to load product. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      try {
        setLoadingReviews(true);
        const response = await api.get(`/reviews/${id}`);
        setReviews(response.data.data);
      } catch (err: any) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !id) return;

      try {
        const wishlistRes = await api.get("/wishlist");
        const wishlistItems = wishlistRes.data.data?.items || [];
        const isInWishlist = wishlistItems.some(
          (item: any) => item.productId === id
        );
        setIsWishlisted(isInWishlist);
      } catch (error) {
        console.error("Failed to check wishlist status", error);
      }
    };

    checkWishlistStatus();
  }, [isAuthenticated, id]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to use wishlist");
      router.push("/login");
      return;
    }

    if (!product) return;

    setTogglingWishlist(true);
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await api.post("/wishlist", { productId: product.id });
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
      toast.error("Please login to add items to your cart.");
      router.push("/login");
      return;
    }

    if (!product) return;

    try {
      await api.post("/cart", {
        productId: product.id,
        quantity: quantity,
      });
      toast.success(`${product.name} added to cart!`);
    } catch (err: any) {
      console.error("Failed to add to cart", err);
      const message =
        err.response?.data?.message || "Failed to add item to cart.";
      toast.error(message);
    }
  };

  const handleReviewSubmit = async (rating: number, content: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to submit a review.");
      router.push("/login");
      return;
    }

    try {
      setIsSubmittingReview(true);
      await api.post(`/reviews/${id}`, {
        rating,
        content: content || undefined,
      });
      toast.success("Review submitted successfully!");

      const response = await api.get(`/reviews/${id}`);
      setReviews(response.data.data);
    } catch (err: any) {
      console.error("Failed to submit review", err);
      const message = err.response?.data?.message || "Failed to submit review.";
      toast.error(message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const ProductSkeleton = () => (
    <div className="grid md:grid-cols-2 gap-12">
      <Skeleton className="w-full aspect-square rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProductSkeleton />
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-destructive">{error}</h1>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return null;
  }

  const averageRating = calculateAverageRating();
  const hasUserReviewed = reviews.some((review) => review.user.id === user?.id);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <Carousel className="w-full">
              <CarouselContent>
                {product.imageUrls.length > 0 ? (
                  product.imageUrls.map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square w-full overflow-hidden rounded-lg">
                        <img
                          src={url}
                          alt={`${product.name} ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
                      <img
                        src="/placeholder.jpg"
                        alt="Placeholder"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              {product.imageUrls.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          </div>

          {/* Product Details */}
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Sold by{" "}
                <Link
                  href={`/store/${product.store.id}`}
                  className="text-primary hover:underline"
                >
                  {product.store.name}
                </Link>
              </p>

              {/* Average Rating Display */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-semibold text-foreground">
                      {averageRating}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({reviews.length} review{reviews.length > 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>
            <p className="text-4xl font-extrabold text-foreground">
              {formatCurrency(product.price)}
            </p>

            {product.stock > 0 ? (
              <Badge className="self-start bg-green-100 text-green-800">
                In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge variant="destructive" className="self-start">
                Out of Stock
              </Badge>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-foreground font-medium">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </Button>
                <span className="px-6 text-foreground">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 text-lg py-6"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                🛒 Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-6"
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

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Description
              </h3>
              <p className="text-foreground/80 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 space-y-8">
          {/* Submit Review Form - Only show if authenticated and hasn't reviewed */}
          {isAuthenticated && !hasUserReviewed && (
            <SubmitReviewForm
              productId={id as string}
              onReviewSubmitted={() => {}}
              isLoading={isSubmittingReview}
              onSubmit={handleReviewSubmit}
            />
          )}

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Customer Reviews</CardTitle>
              <CardDescription>
                {reviews.length > 0
                  ? "See what others think about this product."
                  : "No reviews yet. Be the first to review this product!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingReviews ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={review.user.avatarUrl || undefined} />
                      <AvatarFallback>
                        {review.user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">
                          {review.user.name || "Anonymous User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      {review.content && (
                        <p className="mt-2 text-foreground/90">
                          {review.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No reviews available for this product yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}
