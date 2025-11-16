"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useRouter
import { Header } from "@/components/header";
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
import { api } from "@/services/api"; // Service API kita
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth"; // Import useAuth
import { toast } from "sonner"; // Import toast untuk notifikasi
import Link from "next/link";

// Tipe data detail untuk produk
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

// Tipe data review (masih statis untuk sekarang)
interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  avatar: string;
}

// Kita masih gunakan mockReviews untuk sementara
const mockReviews: Review[] = [
  {
    id: "r1",
    author: "Gisella",
    rating: 5,
    date: "October 20, 2025",
    comment: "Absolutely love this necklace! It's so delicate and beautiful.",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "r2",
    author: "Reina",
    rating: 4,
    date: "October 18, 2025",
    comment: "Great quality for the price. Looks exactly like the picture.",
    avatar: "/placeholder-user.jpg",
  },
];

export default function ProductDetailPage() {
  const params = useParams(); // Mengambil parameter URL
  const { id } = params; // Dapatkan 'id' produk
  const router = useRouter(); // Inisialisasi router
  const { isAuthenticated } = useAuth(); // Dapatkan status auth

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1); // State untuk kuantitas

  // Fungsi untuk format mata uang
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return; // Jangan lakukan apa-apa jika tidak ada ID

      try {
        setLoading(true);
        setError(null);
        // Panggil API backend kita menggunakan 'id'
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
  }, [id]); // Jalankan ulang jika 'id' berubah

  // --- FUNGSI BARU UNTUK ADD TO CART ---
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart.");
      router.push("/login");
      return;
    }

    if (!product) return;

    try {
      // Panggil API backend
      await api.post("/cart", {
        productId: product.id,
        quantity: quantity,
      });
      toast.success(`${product.name} added to cart!`);
    } catch (err: any) {
      console.error("Failed to add to cart", err);
      const message = err.response?.data?.message || "Failed to add item to cart.";
      toast.error(message);
    }
  };

  // Tampilan Skeleton saat loading
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
        <Header />
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
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-destructive">{error}</h1>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return null; // Seharusnya tidak terjadi jika tidak loading atau error
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

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
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
              <p className="text-lg text-muted-foreground mt-2">
                Sold by{" "}
                <Link
                  href={`/store/${product.store.id}`} // Nanti kita buat halaman toko
                  className="text-primary hover:underline"
                >
                  {product.store.name}
                </Link>
              </p>
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

            {/* --- Tombol Kuantitas --- */}
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
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full text-lg py-6"
              disabled={product.stock === 0}
              onClick={handleAddToCart} // Tambahkan onClick di sini
            >
              🛒 Add to Cart
            </Button>
            
            <Separator />

            {/* Description */}
            <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Description</h3>
                <p className="text-foreground/80 whitespace-pre-wrap">
                  {product.description}
                </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Customer Reviews</CardTitle>
              <CardDescription>
                See what others think about this product.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockReviews.map((review) => (
                <div key={review.id} className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={review.avatar} />
                    <AvatarFallback>{review.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{review.author}</p>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {/* Bintang Rating */}
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-foreground/90">{review.comment}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}   