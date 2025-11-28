"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  joinDate: string;
  bio: string | null;
  address: string | null;
}

export default function ProfilePage() {
  const { user, logout, setUser: setAuthUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  });

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Wishlist State
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Settings State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const response = await api.get("/users/me");
        const data = response.data.data;

        const formattedData: ProfileData = {
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "Not set",
          avatarUrl: data.avatarUrl || null,
          joinDate: new Date(data.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          }),
          bio: data.bio || "No bio set.",
          address: data.address || "No address set.",
        };

        setProfileData(formattedData);
        setFormData({
          name: formattedData.name,
          email: formattedData.email,
          phone: formattedData.phone || "",
          address: formattedData.address || "",
          bio: formattedData.bio || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get("/orders");
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      setLoadingWishlist(true);
      const response = await api.get("/wishlist");
      setWishlistItems(response.data.data?.items || []);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await api.get("/addresses");
      setAddresses(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "orders" && orders.length === 0) {
      fetchOrders();
    } else if (value === "wishlist" && wishlistItems.length === 0) {
      fetchWishlist();
    } else if (value === "settings" && addresses.length === 0) {
      fetchAddresses();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await api.patch("/users/me", {
        name: formData.name,
      });

      const updatedUser = response.data.data;

      setProfileData((prev) => ({
        ...prev!,
        name: updatedUser.name,
      }));

      setAuthUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await api.post("/users/me/password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password updated successfully");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Failed to change password", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/addresses/${addressId}`);
      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (error) {
      console.error("Failed to delete address", error);
      toast.error("Failed to delete address");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-24 w-full mb-8" />
          <Skeleton className="h-10 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </main>
    );
  }

  if (!profileData) {
    return <div>Error loading profile.</div>;
  }

  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={profileData.avatarUrl || ""}
                alt={profileData.name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getAvatarFallback(profileData.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {profileData.name}
              </h1>
              <p className="text-muted-foreground mb-2">
                Member since {profileData.joinDate}
              </p>
              <p className="text-foreground">{profileData.bio}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className={
                  isEditing
                    ? "bg-primary hover:bg-primary/90"
                    : "border-border bg-transparent"
                }
              >
                ⚙️ {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
              <Button
                variant="outline"
                onClick={logout}
                className="border-border bg-transparent text-destructive hover:bg-destructive/10"
              >
                🚪 Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="overview"
          className="space-y-6"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Contact Information
              </h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="mt-2 bg-muted"
                    />
                  </div>
                  <Button
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✉️</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-foreground">{profileData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📱</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-foreground">{profileData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📍</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-foreground">{profileData.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {loadingOrders ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-muted-foreground">No orders found.</p>
              ) : (
                orders.map((order: any) => (
                  <Card key={order.id} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">
                        Order #{order.id.slice(-6)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          order.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Total:{" "}
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(order.totalAmount)}
                      </p>
                      <p>
                        Date: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingWishlist ? (
                <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : wishlistItems.length === 0 ? (
                <p className="text-muted-foreground col-span-full">
                  Your wishlist is empty.
                </p>
              ) : (
                wishlistItems.map((item: any) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Link href={`/products/${item.product.id}`}>
                      <div className="h-32 bg-muted relative">
                        {item.product.imageUrls && item.product.imageUrls[0] ? (
                          <img
                            src={item.product.imageUrls[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold truncate hover:text-primary transition-colors">
                          {item.product.name}
                        </h3>
                        <p className="text-primary font-bold">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(item.product.price)}
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Change Password */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          oldPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" disabled={changingPassword}>
                    {changingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Card>

              {/* Address Management */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">My Addresses</h2>
                  <Link href="/checkout">
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" /> Add New
                    </Button>
                  </Link>
                </div>

                {loadingAddresses ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : addresses.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No addresses saved. Add one during checkout.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr: any) => (
                      <div
                        key={addr.id}
                        className="flex justify-between items-start p-3 border rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{addr.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {addr.addressLine}, {addr.city}, {addr.zipCode}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {addr.phone}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
