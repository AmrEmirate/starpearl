"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function StoreVerificationPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [storeStatus, setStoreStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    idCardUrl: "",
    businessLicenseUrl: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchStoreStatus();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchStoreStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get("/stores/my-store");
      const store = response.data.data;
      setStoreStatus(store.status);

      // Pre-fill if data exists (optional, but good for UX if rejected)
      if (store.idCardUrl) {
        setFormData({
          idCardUrl: store.idCardUrl,
          businessLicenseUrl: store.businessLicenseUrl || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch store status", error);
      toast.error("Failed to load store information");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.idCardUrl || !formData.businessLicenseUrl) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/stores/verification", formData);
      toast.success("Verification submitted successfully!");
      fetchStoreStatus(); // Refresh status
    } catch (error: any) {
      console.error("Failed to submit verification", error);
      toast.error(
        error.response?.data?.message || "Failed to submit verification"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (storeStatus === "APPROVED") {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card className="p-8 text-center border-green-200 bg-green-50">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">
            Store Verified
          </h1>
          <p className="text-green-700">
            Your store has been verified and is fully active. You can now manage
            your products and orders.
          </p>
          <Button
            className="mt-6 bg-green-600 hover:bg-green-700"
            onClick={() => router.push("/seller/dashboard")}
          >
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (storeStatus === "PENDING") {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card className="p-8 text-center border-yellow-200 bg-yellow-50">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">
            Verification Under Review
          </h1>
          <p className="text-yellow-700">
            Your verification documents have been submitted and are currently
            under review by our admin team. Please check back later.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Store Verification</h1>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Submit Documents</h2>
          <p className="text-muted-foreground">
            Please provide links to your identification documents. (For this
            demo, you can use any valid image URL).
          </p>
        </div>

        {storeStatus === "REJECTED" && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <strong>Verification Rejected.</strong> Please check your documents
            and try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="idCardUrl">ID Card (KTP) URL</Label>
            <Input
              id="idCardUrl"
              name="idCardUrl"
              placeholder="https://example.com/my-ktp.jpg"
              value={formData.idCardUrl}
              onChange={handleInputChange}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct link to your ID Card image.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessLicenseUrl">
              Business License (SIUP) URL
            </Label>
            <Input
              id="businessLicenseUrl"
              name="businessLicenseUrl"
              placeholder="https://example.com/my-siup.jpg"
              value={formData.businessLicenseUrl}
              onChange={handleInputChange}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct link to your Business License image.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Verification"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
