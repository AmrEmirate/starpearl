"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const storeSchema = z.object({
  name: z.string().min(3, "Store name must be at least 3 characters"),
  description: z.string().optional(),
  // Logo URL is optional for now as we don't have full image upload yet
});

type StoreFormValues = z.infer<typeof storeSchema>;

export default function SellerSettingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "SELLER")) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && user?.role === "SELLER") {
      fetchStoreProfile();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchStoreProfile = async () => {
    try {
      setIsLoadingData(true);
      const response = await api.get("/stores/my-store");
      const store = response.data.data;

      form.reset({
        name: store.name,
        description: store.description || "",
      });
    } catch (error) {
      console.error("Failed to fetch store profile", error);
      toast.error("Failed to load store profile");
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: StoreFormValues) => {
    setIsSubmitting(true);
    try {
      await api.patch("/stores/my-store", data);
      toast.success("Store profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update store profile", error);
      toast.error(
        error.response?.data?.message || "Failed to update store profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Shop Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your store profile and information.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Store" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name that will be displayed to customers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell customers about your store..."
                        className="resize-none h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
