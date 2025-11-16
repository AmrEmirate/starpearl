"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo123");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await login(email, password);

      if (user.role !== selectedRole) {
        setError(`Login failed. This account is a ${user.role.toLowerCase()}, not a ${selectedRole.toLowerCase()}.`);
        return;
      }
      
      const rolePath = user.role.toLowerCase();
      router.push(`/${rolePath}`);

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const roles: { id: UserRole; name: string; description: string; icon: string }[] = [
    {
      id: "BUYER",
      name: "Buyer",
      description: "Browse and purchase accessories",
      icon: "🛍️",
    },
    {
      id: "SELLER",
      name: "Seller",
      description: "Sell your accessories",
      icon: "🏪",
    },
    {
      id: "ADMIN",
      name: "Admin",
      description: "Manage the marketplace",
      icon: "⚙️",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Starpearl</h1>
            <p className="text-muted-foreground">Welcome back</p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-foreground mb-4">Select Your Role</label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedRole === role.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-2">{role.icon}</div>
                  <div className="text-xs font-semibold text-foreground">{role.name}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !selectedRole}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}