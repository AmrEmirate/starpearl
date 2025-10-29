import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute requiredRole="buyer">{children}</ProtectedRoute>
}
