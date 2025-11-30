"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/use-stats";
import { useState, useEffect } from "react";

export function HeroSection() {
  const { stats, loading } = useStats();

  const [banner, setBanner] = useState({
    title: "Discover Amazing Products",
    description:
      "Explore curated collections from trusted sellers and join a vibrant community of shoppers and creators.",
    buttonText: "Start Shopping →",
    buttonLink: "/browse",
  });

  useEffect(() => {
    const savedBanners = localStorage.getItem("admin_banners");
    if (savedBanners) {
      try {
        const parsed = JSON.parse(savedBanners);
        const active = parsed.find((b: any) => b.isActive);
        if (active) {
          setBanner(active);
        }
      } catch (e) {
        console.error("Failed to load banner", e);
      }
    }
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}K+`;
    }
    return num.toString();
  };

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-2 md:gap-8 items-center">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                {banner.title}
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                {banner.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={banner.buttonLink}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                >
                  {banner.buttonText}
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {loading
                    ? "..."
                    : stats
                    ? formatNumber(stats.totalProducts)
                    : "0"}
                </p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {loading
                    ? "..."
                    : stats
                    ? formatNumber(stats.totalUsers)
                    : "0"}
                </p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "..." : stats ? `${stats.averageRating}★` : "0★"}
                </p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>

          <div className="relative h-96 md:h-full min-h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-primary/10 mb-4">
                  <div className="h-24 w-24 rounded-full bg-primary/20" />
                </div>
                <p className="text-muted-foreground">Featured Collection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
