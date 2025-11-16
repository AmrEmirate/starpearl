"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api"; // Import service API kita
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

// Definisikan tipe data untuk produk
// (Sesuai dengan apa yang dikirim oleh BE)
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrls: string[]; // Kita ambil gambar pertama
  stock: number;
  store: {
    name: string;
  };
}

// Hapus mock data:
// const mockProducts = [ ... ]
// const filters = [ ... ]

export default function BrowsePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter statis (bisa dikembangkan nanti)
  const filters = [
    {
      id: "category",
      name: "Category",
      options: [
        { value: "necklaces", label: "Necklaces" },
        { value: "bracelets", label: "Bracelets" },
        { value: "rings", label: "Rings" },
        { value: "earrings", label: "Earrings" },
      ],
    },
    {
      id: "price",
      name: "Price",
      options: [
        { value: "0-25", label: "Rp 0 - Rp 25.000" },
        { value: "25-50", label: "Rp 25.000 - Rp 50.000" },
        { value: "50-100", label: "Rp 50.000 - Rp 100.000" },
      ],
    },
  ];

  // Fungsi untuk format mata uang
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Panggil API backend kita
        const response = await api.get("/products");
        setProducts(response.data.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // [] berarti hanya dijalankan sekali saat mount

  const ProductSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="w-full aspect-square" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-background">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Browse All Products</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Find the perfect accessory for your style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="md:col-span-1">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Filters</h2>
            <Accordion type="multiple" className="w-full" defaultValue={["category"]}>
              {filters.map((section) => (
                <AccordionItem value={section.id} key={section.id}>
                  <AccordionTrigger className="text-lg font-medium">
                    {section.name}
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-3">
                      {section.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox id={`${section.id}-${option.value}`} />
                          <label
                            htmlFor={`${section.id}-${option.value}`}
                            className="text-sm text-foreground"
          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </aside>

          {/* Product Grid */}
          <div className="md:col-span-3">
            {error && <p className="text-destructive">{error}</p>}
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {loading ? (
                // Tampilkan 6 skeleton saat loading
                Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))
              ) : (
                // Tampilkan produk asli
                products.map((product) => (
                  <Link href={`/product/${product.id}`} key={product.id}>
                    <Card className="overflow-hidden transition-all hover:shadow-lg">
                      <CardHeader className="p-0">
                        <AspectRatio ratio={1 / 1}>
                          <img
                            src={product.imageUrls[0] || "/placeholder.jpg"}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </CardHeader>
                      <CardContent className="p-4">
                        <h3 className="text-base font-semibold text-foreground truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {product.store.name}
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(product.price)}
                        </p>
                        {product.stock === 0 && (
                          <Badge variant="destructive" className="mt-2">Out of Stock</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
            
            {!loading && products.length === 0 && !error && (
              <p className="text-muted-foreground text-center col-span-full">
                No products found.
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}