import { HeroSection } from "@/components/hero-section"
import { FeaturedProducts } from "@/components/featured-products"
import { CommunityPreview } from "@/components/community-preview"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturedProducts />
      <CommunityPreview />
      <Footer />
    </main>
  )
}