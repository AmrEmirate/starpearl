import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute requiredRole="seller">{children}</ProtectedRoute>
}
