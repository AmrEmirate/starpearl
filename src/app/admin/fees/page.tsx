"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface ServiceFeeSettings {
  minFreeThreshold: number;
  feeAmount: number;
  feeMultiplier: number;
}

const DEFAULT_SETTINGS: ServiceFeeSettings = {
  minFreeThreshold: 50000,
  feeAmount: 1000,
  feeMultiplier: 100000,
};

export default function AdminFeesPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] =
    useState<ServiceFeeSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router, loading]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/admin/settings");
      if (data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
      toast.error("Failed to load settings");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put("/admin/settings", settings);
      toast.success("Service fee settings updated successfully");
    } catch (error) {
      console.error("Failed to save settings", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/admin"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Service Fee Management
          </h1>
          <p className="text-muted-foreground">
            Configure the platform service fee rules.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fee Configuration</CardTitle>
            <CardDescription>
              Adjust how service fees are calculated for buyers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="threshold">Minimum Free Threshold (Rp)</Label>
              <Input
                id="threshold"
                type="number"
                value={settings.minFreeThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minFreeThreshold: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Transactions below this amount will be free of service charge.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Fee Amount (Rp)</Label>
              <Input
                id="amount"
                type="number"
                value={settings.feeAmount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    feeAmount: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                The base fee amount charged per multiplier.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="multiplier">Fee Multiplier (Rp)</Label>
              <Input
                id="multiplier"
                type="number"
                value={settings.feeMultiplier}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    feeMultiplier: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                The fee increases by the Fee Amount for every multiple of this
                value.
              </p>
            </div>

            <div className="pt-4 bg-muted/30 p-4 rounded-lg border border-border">
              <h4 className="font-semibold mb-2 text-sm">
                Preview Calculation
              </h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>
                  If a user buys <strong>Rp 49,000</strong>: Fee ={" "}
                  <strong>
                    Rp{" "}
                    {settings.minFreeThreshold > 49000
                      ? 0
                      : Math.ceil(49000 / settings.feeMultiplier) *
                        settings.feeAmount}
                  </strong>
                </p>
                <p>
                  If a user buys <strong>Rp {settings.minFreeThreshold}</strong>
                  : Fee ={" "}
                  <strong>
                    Rp{" "}
                    {Math.ceil(
                      settings.minFreeThreshold / settings.feeMultiplier
                    ) * settings.feeAmount}
                  </strong>
                </p>
                <p>
                  If a user buys{" "}
                  <strong>Rp {settings.feeMultiplier * 2}</strong>: Fee ={" "}
                  <strong>
                    Rp{" "}
                    {Math.ceil(
                      (settings.feeMultiplier * 2) / settings.feeMultiplier
                    ) * settings.feeAmount}
                  </strong>
                </p>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
