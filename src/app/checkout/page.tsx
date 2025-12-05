"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

interface Address {
  id: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
  product: {
    name: string;
    price: string;
  };
}

interface Cart {
  items: CartItem[];
  total: number;
}

declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fee Settings State
  const [feeSettings, setFeeSettings] = useState({
    minFreeThreshold: 50000,
    feeAmount: 1000,
    feeMultiplier: 100000,
  });

  // Voucher State
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [addressRes, cartRes] = await Promise.all([
        api.get("/addresses"),
        api.get("/cart"),
      ]);

      setAddresses(addressRes.data.data);
      setCart(cartRes.data.data);

      // Set default address if available
      const defaultAddress = addressRes.data.data.find(
        (a: Address) => a.isDefault
      );
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressRes.data.data.length > 0) {
        setSelectedAddressId(addressRes.data.data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch checkout data", error);
      toast.error("Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  // Fee settings are already set as defaults in useState - no need to fetch from admin
  // The actual fee calculation is done on the backend

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;

    try {
      // Try to validate voucher via a public endpoint
      const { data } = await api.post("/vouchers/validate", {
        code: voucherCode,
        subtotal: cart?.total || 0,
      });

      if (data.data?.valid) {
        setDiscount(Number(data.data.discountValue || 0));
        toast.success("Voucher applied successfully!");
      } else {
        toast.error(data.data?.message || "Invalid voucher code");
        setDiscount(0);
      }
    } catch (error: any) {
      // If voucher validation endpoint fails, just notify user
      toast.info("Voucher will be validated at checkout");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    setProcessing(true);
    try {
      // 1. Create Order & Get Snap Token
      const res = await api.post("/checkout", {
        addressId: selectedAddressId,
        logisticsOption: "Standard",
        paymentMethod: "Midtrans",
        shippingCost: shipping,
        serviceFee: serviceFee,
        totalPrice: total,
        voucherCode: voucherCode || undefined,
      });
      const { snapToken } = res.data.data;

      if (!snapToken) {
        throw new Error("No payment token received");
      }

      // 2. Open Snap Popup
      window.snap.pay(snapToken, {
        onSuccess: function (result: any) {
          toast.success("Payment successful!");
          router.push("/orders");
        },
        onPending: function (result: any) {
          toast.info("Waiting for payment...");
          router.push("/orders");
        },
        onError: function (result: any) {
          toast.error("Payment failed!");
          console.error(result);
        },
        onClose: function () {
          toast.warning("Payment popup closed without finishing payment");
          router.push("/orders");
        },
      });
    } catch (error: any) {
      console.error("Failed to place order", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="md:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => router.push("/")}>Start Shopping</Button>
      </div>
    );
  }

  const subtotal = cart.total;
  const serviceFee =
    subtotal < feeSettings.minFreeThreshold
      ? 0
      : Math.ceil(subtotal / feeSettings.feeMultiplier) * feeSettings.feeAmount;
  const shipping = subtotal > 200000 ? 0 : 25000;
  const total = Math.max(0, subtotal + shipping + serviceFee - discount);

  return (
    <div className="min-h-screen bg-background py-12">
      {/* Midtrans Snap Script (Sandbox) */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={
          process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
          "SB-Mid-client-placeholder"
        }
        strategy="lazyOnload"
      />

      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Address & Payment */}
          <div className="md:col-span-2 space-y-8">
            {/* Shipping Address */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                <Link href="/addresses/new">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </Link>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No addresses found. Please add one.
                </div>
              ) : (
                <RadioGroup
                  value={selectedAddressId}
                  onValueChange={setSelectedAddressId}
                  className="space-y-4"
                >
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddressId === address.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <RadioGroupItem
                        value={address.id}
                        id={address.id}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={address.id}
                          className="font-semibold cursor-pointer"
                        >
                          {address.recipientName} (
                          {address.isDefault && "Default"})
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {address.phone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.street}, {address.city}, {address.state}{" "}
                          {address.postalCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="border rounded-lg p-4 bg-muted/50">
                <p className="font-medium">Midtrans Payment Gateway</p>
                <p className="text-sm text-muted-foreground">
                  Secure payment via Bank Transfer, Credit Card, GoPay, etc.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span>
                      {formatCurrency(
                        Number(item.product.price) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span
                    className={
                      shipping === 0 ? "text-green-600 font-medium" : ""
                    }
                  >
                    {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>{formatCurrency(serviceFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({voucherCode})</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
              </div>

              <div className="py-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Voucher Code"
                    value={voucherCode}
                    onChange={(e) =>
                      setVoucherCode(e.target.value.toUpperCase())
                    }
                  />
                  <Button variant="outline" onClick={handleApplyVoucher}>
                    Apply
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                className="w-full py-6 text-lg"
                onClick={handlePlaceOrder}
                disabled={processing || addresses.length === 0}
              >
                {processing ? "Processing..." : "Place Order & Pay"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
