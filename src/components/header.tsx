"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="text-xl font-bold text-foreground">Starpearl</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Products
          </Link>
          <Link href="/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Community
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/cart">
                <Button variant="ghost" size="sm">
                  🛒 Cart
                </Button>
              </Link>
              <Link href={`/${user.role}`}>
                <Button variant="ghost" size="sm">
                  👤 {user.name}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              🛒
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? "✕" : "☰"}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="/browse"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Products
            </Link>
            <Link
              href="/community"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Community
            </Link>
            <Link href="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <div className="pt-3 border-t border-border space-y-2">
              {user ? (
                <>
                  <Link href={`/${user.role}`} className="block">
                    <Button variant="outline" className="w-full border-border bg-transparent">
                      👤 {user.name}
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
