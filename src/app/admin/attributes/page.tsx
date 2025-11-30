"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AttributeValue {
  id: string;
  value: string;
}

interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
}

export default function AdminAttributesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState("");

  // For adding values
  const [addingValueTo, setAddingValueTo] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && user?.role === "ADMIN") {
      fetchAttributes();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/attributes");
      setAttributes(response.data.data);
    } catch (error) {
      console.error("Failed to fetch attributes", error);
      toast.error("Failed to load attributes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = async () => {
    if (!newAttributeName) {
      toast.error("Attribute name is required");
      return;
    }

    try {
      await api.post("/attributes", { name: newAttributeName });
      toast.success("Attribute created successfully");
      setIsAdding(false);
      setNewAttributeName("");
      fetchAttributes();
    } catch (error: any) {
      console.error("Failed to create attribute", error);
      toast.error(
        error.response?.data?.message || "Failed to create attribute"
      );
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attribute?")) return;

    try {
      await api.delete(`/attributes/${id}`);
      toast.success("Attribute deleted successfully");
      fetchAttributes();
    } catch (error) {
      console.error("Failed to delete attribute", error);
      toast.error("Failed to delete attribute");
    }
  };

  const handleAddValue = async (attributeId: string) => {
    if (!newValue) return;

    try {
      await api.post(`/attributes/${attributeId}/values`, { value: newValue });
      toast.success("Value added successfully");
      setNewValue("");
      setAddingValueTo(null);
      fetchAttributes();
    } catch (error: any) {
      console.error("Failed to add value", error);
      toast.error(error.response?.data?.message || "Failed to add value");
    }
  };

  const handleDeleteValue = async (valueId: string) => {
    if (!confirm("Delete this value?")) return;

    try {
      await api.delete(`/attributes/values/${valueId}`);
      toast.success("Value deleted");
      fetchAttributes();
    } catch (error) {
      console.error("Failed to delete value", error);
      toast.error("Failed to delete value");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/admin"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
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
              Attribute Management
            </h1>
            <p className="text-muted-foreground">
              Manage product attributes (e.g., Color, Material) and their
              values.
            </p>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 mr-2" /> Add New Attribute
          </Button>
        </div>

        {isAdding && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>New Attribute</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Attribute Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAttributeName}
                    onChange={(e) => setNewAttributeName(e.target.value)}
                    placeholder="e.g. Material"
                  />
                  <Button onClick={handleAddAttribute}>Save</Button>
                  <Button variant="ghost" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {attributes.map((attribute) => (
            <Card key={attribute.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">{attribute.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteAttribute(attribute.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {attribute.values.map((val) => (
                    <Badge
                      key={val.id}
                      variant="secondary"
                      className="pl-2 pr-1 py-1 flex items-center gap-1"
                    >
                      {val.value}
                      <button
                        onClick={() => handleDeleteValue(val.id)}
                        className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setAddingValueTo(attribute.id)}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Value
                  </Button>
                </div>

                {addingValueTo === attribute.id && (
                  <div className="flex gap-2 items-center mt-2 max-w-sm">
                    <Input
                      size={1}
                      className="h-8 text-sm"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder={`New ${attribute.name} value...`}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddValue(attribute.id);
                        if (e.key === "Escape") setAddingValueTo(null);
                      }}
                    />
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => handleAddValue(attribute.id)}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => setAddingValueTo(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
