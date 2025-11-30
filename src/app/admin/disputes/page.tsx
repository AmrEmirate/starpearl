"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Dispute {
  id: string;
  orderId: string;
  reason: string;
  amount: number;
  status: "PENDING" | "RESOLVED_REFUND" | "RESOLVED_RELEASE";
  createdAt: string;
  buyer: {
    name: string;
    email: string;
  };
  store: {
    name: string;
  };
}

export default function AdminDisputesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && user?.role === "ADMIN") {
      fetchDisputes();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/disputes");
      setDisputes(response.data.data);
    } catch (error) {
      console.error("Failed to fetch disputes", error);
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (
    id: string,
    resolution: "RESOLVED_REFUND" | "RESOLVED_RELEASE"
  ) => {
    if (
      !confirm(
        `Are you sure you want to ${
          resolution === "RESOLVED_REFUND"
            ? "refund the buyer"
            : "release funds to seller"
        }?`
      )
    )
      return;

    try {
      await api.post(`/admin/disputes/${id}/resolve`, { status: resolution });
      toast.success(
        resolution === "RESOLVED_REFUND"
          ? "Refund processed for buyer"
          : "Funds released to seller"
      );
      fetchDisputes();
    } catch (error) {
      console.error("Failed to resolve dispute", error);
      toast.error("Failed to resolve dispute");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-5xl">
          <Link
            href="/admin"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href="/admin"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dispute Management
          </h1>
          <p className="text-muted-foreground">
            Resolve conflicts between buyers and sellers.
          </p>
        </div>

        {disputes.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">No active disputes</h2>
            <p className="text-muted-foreground">
              Everything is running smoothly!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {disputes.map((dispute) => (
              <Card key={dispute.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">
                          #{dispute.id.slice(-6).toUpperCase()}
                        </h3>
                        <Badge
                          variant={
                            dispute.status === "PENDING"
                              ? "outline"
                              : dispute.status === "RESOLVED_REFUND"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {dispute.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Order: {dispute.orderId} • Date:{" "}
                        {format(new Date(dispute.createdAt), "PPP")}
                      </p>
                      <p className="text-sm mb-2">
                        <strong>Buyer:</strong> {dispute.buyer.name} (
                        {dispute.buyer.email}) vs <strong>Seller:</strong>{" "}
                        {dispute.store.name}
                      </p>
                      <div className="bg-muted/50 p-3 rounded-md text-sm">
                        <strong>Reason:</strong> {dispute.reason}
                        <br />
                        <strong>Amount:</strong> Rp{" "}
                        {Number(dispute.amount).toLocaleString()}
                      </div>
                    </div>

                    {dispute.status === "PENDING" && (
                      <div className="flex flex-col gap-2 justify-center min-w-[200px]">
                        <Button
                          variant="destructive"
                          onClick={() =>
                            handleResolve(dispute.id, "RESOLVED_REFUND")
                          }
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Refund Buyer
                        </Button>
                        <Button
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            handleResolve(dispute.id, "RESOLVED_RELEASE")
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Release to
                          Seller
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
