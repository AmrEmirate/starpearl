"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MessageCircle, UserPlus, UserMinus, MapPin } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";

interface Store {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
}

export default function StoreProfilePage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStore();
    }
  }, [id]);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/stores/${id}`);
      setStore(response.data.data);
      // Check follow status if logged in (mock for now or implement check API)
    } catch (error) {
      console.error("Failed to fetch store", error);
      toast.error("Failed to load store profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      if (isFollowing) {
        await api.delete(`/stores/${id}/follow`);
        setIsFollowing(false);
        toast.success("Unfollowed store");
      } else {
        await api.post(`/stores/${id}/follow`);
        setIsFollowing(true);
        toast.success("Followed store");
      }
    } catch (error) {
      console.error("Failed to follow/unfollow", error);
      toast.error("Action failed");
    }
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Redirect to chat with this store
    router.push(`/chat?storeId=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-64 w-full mb-8 rounded-lg" />
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-8">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-4 flex-1">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Store not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Banner */}
      <div className="h-64 w-full relative bg-muted">
        {store.bannerUrl ? (
          <img
            src={store.bannerUrl}
            alt="Store Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Banner
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 max-w-7xl -mt-16 relative z-10 mb-12">
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-white shadow-sm -mt-16">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                    {store.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
                <p className="text-muted-foreground max-w-2xl">
                  {store.description || "No description available."}
                </p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  className="flex-1 md:flex-none"
                  onClick={handleFollow}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" /> Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" /> Follow
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 md:flex-none"
                  onClick={handleChat}
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto px-4 max-w-7xl mb-16">
        <h2 className="text-2xl font-bold mb-6">Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* We need to fetch products for this store separately or include them in the store response */}
          {/* For now assuming store endpoint returns products or we fetch them here */}
          {/* Since getStoreById in backend uses findById which usually doesn't include relations unless specified */}
          {/* I should update the backend service to include products or fetch them separately */}
          <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">
              Products loading... (Backend update needed to include products)
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
