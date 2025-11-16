"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

// Hapus mock data:
// const userProfile = { ... }
// const orders = [ ... ]
// const wishlist = [ ... ]

// Tipe data untuk profile
interface ProfileData {
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  joinDate: string; // Kita akan format ini
  bio: string | null;
  address: string | null;
}

export default function ProfilePage() {
  const { user, logout, setUser: setAuthUser } = useAuth(); // Ambil 'user' dari context
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Kirim hanya data yang berubah dan diizinkan (saat ini hanya 'name')
      const response = await api.patch("/users/me", {
        name: formData.name,
        // Anda bisa tambahkan field lain di sini setelah BE di-update
      });
      
      const updatedUser = response.data.data;

      // Update data di profile page
      setProfileData((prev) => ({
        ...prev!,
        name: updatedUser.name,
      }));

      // Update data user di AuthContext dan localStorage
      setAuthUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      // Di sini Anda bisa menambahkan toast error
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-24 w-full mb-8" />
          <Skeleton className="h-10 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!profileData) {
    return <div>Error loading profile.</div>;
  }

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profileData.avatarUrl || ''} alt={profileData.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getAvatarFallback(profileData.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{profileData.name}</h1>
              <p className="text-muted-foreground mb-2">Member since {profileData.joinDate}</p>
              <p className="text-foreground">{profileData.bio}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? "bg-primary hover:bg-primary/90" : "border-border bg-transparent"}
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* ... (Konten statis overview bisa tetap di sini) ... */}
            
            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Contact Information</h2>
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
                  {/* Tambahkan field lain di sini jika BE sudah mendukung */}
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
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

          {/* (Tabs Orders, Wishlist, Settings masih menggunakan mock data/statis) */}
          <TabsContent value="orders">
             {/* ... (Konten tab orders) ... */}
             <p className="text-muted-foreground">Fitur riwayat pesanan akan segera hadir.</p>
          </TabsContent>
          <TabsContent value="wishlist">
             {/* ... (Konten tab wishlist) ... */}
             <p className="text-muted-foreground">Fitur wishlist akan segera hadir.</p>
          </TabsContent>
           <TabsContent value="settings">
             {/* ... (Konten tab settings) ... */}
          </TabsContent>

        </Tabs>
      </div>

      <Footer />
    </main>
  );
}