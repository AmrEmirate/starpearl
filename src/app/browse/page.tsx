"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
  stock: number;
  store: {
    name: string;
  };
}

const PRODUCTS_PER_PAGE = 9;

export default function BrowsePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(
    null
  );

  // Categories from API
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([]);

  // Debounce search query to prevent too many API calls
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const priceRanges = [
    { value: "0-100000", label: "Under Rp 100.000" },
    { value: "100000-300000", label: "Rp 100.000 - Rp 300.000" },
    { value: "300000-500000", label: "Rp 300.000 - Rp 500.000" },
    { value: "500000-100000000", label: "Above Rp 500.000" },
  ];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};

      if (debouncedSearch) params.q = debouncedSearch;
      if (selectedCategories.length > 0)
        params.category = selectedCategories[0]; // Simple implementation: single category for now
      if (selectedPriceRange) {
        const [min, max] = selectedPriceRange.split("-");
        params.minPrice = min;
        params.maxPrice = max;
      }

      const response = await api.get("/products", { params });
      setProducts(response.data.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategories, selectedPriceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(
      (prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [category] // Single select for now to match backend simple implementation
    );
  };

  const handlePriceChange = (range: string) => {
    setSelectedPriceRange((prev) => (prev === range ? null : range));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
          <h1 className="text-4xl font-bold text-foreground">
            Browse All Products
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Find the perfect accessory for your style.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="md:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Filters
              </h2>
              {(selectedCategories.length > 0 || selectedPriceRange) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-8"
                >
                  Clear All
                </Button>
              )}
            </div>

            <Accordion
              type="multiple"
              className="w-full"
              defaultValue={["category", "price"]}
            >
              {/* Category Filter */}
              <AccordionItem value="category">
                <AccordionTrigger className="text-lg font-medium">
                  Category
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={() =>
                            handleCategoryChange(category.name)
                          }
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="text-sm text-foreground cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Price Filter */}
              <AccordionItem value="price">
                <AccordionTrigger className="text-lg font-medium">
                  Price
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-3">
                    {priceRanges.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`price-${option.value}`}
                          checked={selectedPriceRange === option.value}
                          onCheckedChange={() =>
                            handlePriceChange(option.value)
                          }
                        />
                        <label
                          htmlFor={`price-${option.value}`}
                          className="text-sm text-foreground cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </aside>

          {/* Product Grid */}
          <div className="md:col-span-3">
            {error && <p className="text-destructive">{error}</p>}

            {/* Products Count */}
            {!loading && products.length > 0 && (
              <p className="text-sm text-muted-foreground mb-4">
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * PRODUCTS_PER_PAGE + 1,
                  products.length
                )}
                -{Math.min(currentPage * PRODUCTS_PER_PAGE, products.length)} of{" "}
                {products.length} products
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: 9 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))
                : products
                    .slice(
                      (currentPage - 1) * PRODUCTS_PER_PAGE,
                      currentPage * PRODUCTS_PER_PAGE
                    )
                    .map((product) => (
                      <Link href={`/product/${product.id}`} key={product.id}>
                        <Card className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
                          <CardHeader className="p-0">
                            <AspectRatio ratio={1 / 1}>
                              <img
                                src={product.imageUrls[0] || "/placeholder.jpg"}
                                alt={product.name}
                                className="object-cover w-full h-full"
                              />
                            </AspectRatio>
                          </CardHeader>
                          <CardContent className="p-4 flex-1 flex flex-col">
                            <h3 className="text-base font-semibold text-foreground truncate mb-1">
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {product.store.name}
                            </p>
                            <div className="mt-auto">
                              <p className="text-lg font-bold text-foreground">
                                {formatCurrency(product.price)}
                              </p>
                              {product.stock === 0 && (
                                <Badge variant="destructive" className="mt-2">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
            </div>

            {/* Pagination */}
            {!loading && products.length > PRODUCTS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({
                    length: Math.ceil(products.length / PRODUCTS_PER_PAGE),
                  }).map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      className="w-9 h-9"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        Math.ceil(products.length / PRODUCTS_PER_PAGE),
                        prev + 1
                      )
                    )
                  }
                  disabled={
                    currentPage >=
                    Math.ceil(products.length / PRODUCTS_PER_PAGE)
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {!loading && products.length === 0 && !error && (
              <div className="text-center py-16 col-span-full">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
