"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Store {
  id: string;
  name: string;
  status: string;
  idCardUrl: string | null;
  businessLicenseUrl: string | null;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/stores/pending");
      setStores(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stores", error);
      toast.error("Failed to fetch pending stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleVerify = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.patch(`/admin/stores/${id}/verify`, { status });
      toast.success(`Store ${status.toLowerCase()} successfully`);
      fetchStores();
    } catch (error) {
      console.error("Failed to verify store", error);
      toast.error("Failed to update store status");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Pending Store Verifications</h1>

      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No pending store verifications.
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{store.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {store.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {store.idCardUrl && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" /> ID Card
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>ID Card - {store.name}</DialogTitle>
                            </DialogHeader>
                            <img
                              src={store.idCardUrl}
                              alt="ID Card"
                              className="w-full h-auto"
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                      {store.businessLicenseUrl && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" /> License
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>
                                Business License - {store.name}
                              </DialogTitle>
                            </DialogHeader>
                            <img
                              src={store.businessLicenseUrl}
                              alt="License"
                              className="w-full h-auto"
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleVerify(store.id, "APPROVED")}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerify(store.id, "REJECTED")}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
