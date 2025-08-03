import Hero from "../components/hero"
import Features from "../components/features"
import Demo from "../components/demo"
import Integration from "../components/integration"
import Documentation from "../components/documentation"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Demo />
      <Integration />
      <Documentation />
    </main>
  )
}
