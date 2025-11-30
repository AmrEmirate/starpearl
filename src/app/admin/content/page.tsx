"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
  isActive: boolean;
}

const DEFAULT_BANNER: Banner = {
  id: "default-1",
  title: "Discover Amazing Products",
  description:
    "Explore curated collections from trusted sellers and join a vibrant community of shoppers and creators.",
  buttonText: "Start Shopping →",
  buttonLink: "/browse",
  isActive: true,
};

export default function AdminContentPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({});

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router, loading]);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const { data } = await api.get("/admin/content");
      setBanners(data.data);
    } catch (error) {
      console.error("Failed to load banners", error);
      toast.error("Failed to load banners");
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.description) {
      toast.error("Title and Description are required");
      return;
    }

    try {
      await api.post("/admin/content", {
        ...newBanner,
        buttonText: newBanner.buttonText || "Learn More",
        buttonLink: newBanner.buttonLink || "/browse",
        isActive: true,
      });
      loadBanners();
      setIsAdding(false);
      setNewBanner({});
      toast.success("Banner added successfully");
    } catch (error) {
      console.error("Failed to add banner", error);
      toast.error("Failed to add banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      try {
        await api.delete(`/admin/content/${id}`);
        loadBanners();
        toast.success("Banner deleted");
      } catch (error) {
        console.error("Failed to delete banner", error);
        toast.error("Failed to delete banner");
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    const banner = banners.find((b) => b.id === id);
    if (!banner) return;

    try {
      await api.put(`/admin/content/${id}`, { isActive: !banner.isActive });
      loadBanners();
    } catch (error) {
      console.error("Failed to update banner", error);
      toast.error("Failed to update banner");
    }
  };

  if (loading || !isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Content Management
            </h1>
            <p className="text-muted-foreground">
              Manage homepage banners and featured content.
            </p>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 mr-2" /> Add New Banner
          </Button>
        </div>

        {isAdding && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>New Banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newBanner.title || ""}
                    onChange={(e) =>
                      setNewBanner({ ...newBanner, title: e.target.value })
                    }
                    placeholder="e.g. Summer Sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={newBanner.buttonText || ""}
                    onChange={(e) =>
                      setNewBanner({ ...newBanner, buttonText: e.target.value })
                    }
                    placeholder="e.g. Shop Now"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newBanner.description || ""}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, description: e.target.value })
                  }
                  placeholder="Banner description..."
                />
              </div>
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input
                  value={newBanner.buttonLink || ""}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, buttonLink: e.target.value })
                  }
                  placeholder="/browse"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBanner}>Save Banner</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {banners.map((banner) => (
            <Card
              key={banner.id}
              className={!banner.isActive ? "opacity-60" : ""}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{banner.title}</h3>
                    <p className="text-muted-foreground mb-4">
                      {banner.description}
                    </p>
                    <div className="flex gap-2 text-sm">
                      <span className="bg-muted px-2 py-1 rounded">
                        Button: {banner.buttonText}
                      </span>
                      <span className="bg-muted px-2 py-1 rounded">
                        Link: {banner.buttonLink}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={banner.isActive ? "default" : "secondary"}
                      size="sm"
                      onClick={() => handleToggleActive(banner.id)}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
