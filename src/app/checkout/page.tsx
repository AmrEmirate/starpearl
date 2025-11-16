"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth"; // Import useAuth

// Tipe data untuk Alamat (dari backend)
interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

// Tipe data untuk Keranjang (dari backend)
interface Cart {
  id: string | null;
  items: any[];
  total: number;
}

// Tipe data untuk Pesanan (dari backend)
interface Order {
  id: string;
  totalAmount: number;
}

// Tipe data untuk Metode Pembayaran (statis)
interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "va",
    name: "Virtual Account",
    description: "BCA, BNI, Mandiri, BRI",
    icon: "💳",
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    description: "GoPay, OVO, ShopeePay",
    icon: "📱",
  },
  { id: "qris", name: "QRIS", description: "Scan QR code", icon: "Q" },
];

const initialAddressForm = {
  label: "",
  recipientName: "",
  phone: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  isDefault: false,
};

export default function CheckoutPage() {
  const { user } = useAuth(); // Ambil data user
  const [step, setStep] = useState<"checkout" | "confirmation">("checkout");
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(
    undefined
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("va");

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState(initialAddressForm);
  const [formLoading, setFormLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const fetchAddresses = async () => {
    try {
      const addressRes = await api.get("/addresses");
      const fetchedAddresses: Address[] = addressRes.data.data;
      setAddresses(fetchedAddresses);

      const defaultAddress = fetchedAddresses.find((a) => a.isDefault);
      const newAddress = fetchedAddresses[fetchedAddresses.length - 1];

      if (isAddressDialogOpen) {
        setSelectedAddressId(newAddress.id);
      } else if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (fetchedAddresses.length > 0) {
        setSelectedAddressId(fetchedAddresses[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch addresses", error);
      toast.error("Failed to load addresses.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cartRes = await api.get("/cart");
        setCart(cartRes.data.data);
        await fetchAddresses();
      } catch (error) {
        console.error("Failed to fetch checkout data", error);
        toast.error("Failed to load checkout data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setNewAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await api.post("/addresses", newAddressForm);
      setNewAddressForm(initialAddressForm);
      setIsAddressDialogOpen(false);
      toast.success("New address added successfully!");
      await fetchAddresses(); 
    } catch (err: any) {
      console.error("Failed to add address", err);
      const message = err.response?.data?.message || "Failed to add address.";
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  const subtotal = cart?.total || 0;
  // [cite_start]// Sesuai blueprint [cite: 71-73]
  const serviceFee = subtotal < 50000 ? 0 : Math.ceil(subtotal / 100000) * 1000;
  const shipping = subtotal > 200000 ? 0 : 25000; // Contoh statis
  const total = subtotal + shipping + serviceFee;

  // --- FUNGSI UTAMA: PLACE ORDER ---
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address.");
      return;
    }
    if (!selectedPaymentId) {
        toast.error("Please select a payment method.");
        return;
    }

    setOrderLoading(true);
    
    const orderData = {
        addressId: selectedAddressId,
        logisticsOption: "JNE REG", // (Contoh, nanti bisa dibuat dinamis)
        paymentMethod: selectedPaymentId,
        shippingCost: shipping,
        serviceFee: serviceFee,
        subtotal: subtotal,
        totalPrice: total,
    };

    try {
        // Panggil API backend
        const response = await api.post("/orders", orderData);
        setCompletedOrder(response.data.data); // Simpan data order
        setStep("confirmation"); // Pindah ke halaman konfirmasi
        toast.success("Order placed successfully!");
    } catch (err: any) {
        console.error("Failed to place order", err);
        const message = err.response?.data?.message || "Failed to place order.";
        toast.error(message);
    } finally {
        setOrderLoading(false);
    }
  };

  if (loading) {
    // ... (Tampilan loading skeleton)
    return (
        <main className="min-h-screen bg-background">
          <Header />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-8 w-1/3 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
          <Footer />
        </main>
      );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Konten berubah berdasarkan 'step' */}
        {step === "checkout" ? (
          <>
            <div className="mb-8">
              <Link
                href="/cart"
                className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
              >
                ← Back to Cart
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bagian Kiri: Alamat dan Pembayaran */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Shipping Address</CardTitle>
                    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Add new address</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                          <DialogDescription>
                            Enter your new shipping address details.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddNewAddress} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="label" className="text-right">Label</Label>
                                <Input id="label" name="label" value={newAddressForm.label} onChange={handleFormChange} className="col-span-3" placeholder="Home, Office..." required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="recipientName" className="text-right">Name</Label>
                                <Input id="recipientName" name="recipientName" value={newAddressForm.recipientName} onChange={handleFormChange} className="col-span-3" placeholder="Full Name" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">Phone</Label>
                                <Input id="phone" name="phone" value={newAddressForm.phone} onChange={handleFormChange} className="col-span-3" placeholder="+62..." required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="street" className="text-right">Street</Label>
                                <Input id="street" name="street" value={newAddressForm.street} onChange={handleFormChange} className="col-span-3" placeholder="Jl. Merdeka No. 1" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="city" className="text-right">City</Label>
                                <Input id="city" name="city" value={newAddressForm.city} onChange={handleFormChange} className="col-span-3" placeholder="Jakarta Selatan" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="province" className="text-right">Province</Label>
                                <Input id="province" name="province" value={newAddressForm.province} onChange={handleFormChange} className="col-span-3" placeholder="DKI Jakarta" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="postalCode" className="text-right">Postal Code</Label>
                                <Input id="postalCode" name="postalCode" value={newAddressForm.postalCode} onChange={handleFormChange} className="col-span-3" placeholder="12345" required />
                            </div>
                            <div className="flex items-center space-x-2 col-start-2 col-span-3">
                                <Checkbox id="isDefault" name="isDefault" checked={newAddressForm.isDefault} onCheckedChange={(checked) => {
                                setNewAddressForm(prev => ({...prev, isDefault: !!checked}))
                                }} />
                                <Label htmlFor="isDefault">Set as default address</Label>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={formLoading}>
                                {formLoading ? "Saving..." : "Save Address"}
                                </Button>
                            </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={selectedAddressId}
                      onValueChange={setSelectedAddressId}
                      className="space-y-4"
                    >
                      {addresses.length > 0 ? (
                        addresses.map((address) => (
                          <React.Fragment key={address.id}>
                            <RadioGroupItem
                              value={address.id}
                              id={address.id}
                              className="peer hidden"
                            />
                            <Label
                              htmlFor={address.id}
                              className="block p-4 border border-border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-foreground">
                                  {address.label}
                                </span>
                                {address.isDefault && (
                                  <Badge variant="outline">Default</Badge>
                                )}
                              </div>
                              <p className="font-medium text-foreground">
                                {address.recipientName}
                              </p>
                              <p className="text-muted-foreground">{address.phone}</p>
                              <p className="text-muted-foreground">
                                {address.street}
                              </p>
                              <p className="text-muted-foreground">
                                {address.city}, {address.province},{" "}
                                {address.postalCode}
                              </p>
                            </Label>
                          </React.Fragment>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          You have no addresses. Please add a new address.
                        </p>
                      )}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={selectedPaymentId}
                      onValueChange={setSelectedPaymentId}
                      className="space-y-4"
                    >
                      {mockPaymentMethods.map((method) => (
                        <React.Fragment key={method.id}>
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            className="peer hidden"
                          />
                          <Label
                            htmlFor={method.id}
                            className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          >
                            <span className="text-2xl">{method.icon}</span>
                            <div>
                              <p className="font-medium text-foreground">
                                {method.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {method.description}
                              </p>
                            </div>
                          </Label>
                        </React.Fragment>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Bagian Kanan: Order Summary */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-20 space-y-4">
                  <h2 className="text-xl font-bold text-foreground">
                    Order Summary
                  </h2>

                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex justify-between text-foreground">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-foreground">
                      <span>Shipping</span>
                      <span>{formatCurrency(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-foreground">
                      <span>Service Fee</span>
                      <span>{formatCurrency(serviceFee)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base"
                    onClick={handlePlaceOrder}
                    disabled={orderLoading}
                  >
                    {orderLoading ? "Placing Order..." : "Place Order"}
                  </Button>
                </Card>
              </div>
            </div>
          </>
        ) : (
          // --- TAMPILAN KONFIRMASI (STEP 2) ---
          <Card className="p-6 md:p-12 text-center max-w-lg mx-auto">
            <div className="mb-6">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h2>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order is now pending payment.
              </p>
            </div>

            <div className="bg-muted rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-muted-foreground mb-2">Order Number</p>
              <p className="text-2xl font-bold text-foreground">
                #{completedOrder?.id.substring(0, 8).toUpperCase()}
              </p>
            </div>

            <p className="text-muted-foreground mb-6">
              A confirmation email has been sent to{" "}
              <span className="font-semibold text-foreground">{user?.email}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/browse" className="flex-1">
                <Button variant="outline" className="w-full border-border bg-transparent">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/profile" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  View My Orders
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      <Footer />
    </main>
  );
}