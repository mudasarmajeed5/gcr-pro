import { FloatingHeader } from "./floating-header"
import { HeroSection } from "./hero-section"
import { ProblemSolutionSection } from "./problem-solution-section"
import { FeaturesShowcase } from "./features-showcase"
import { HowItWorks } from "./how-it-works"
import { SuccessMetrics } from "./success-metrics"
import { OpenSourceShowcase } from "./open-source-showcase"
import { FinalCTA } from "./final-cta"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <FloatingHeader />
      <HeroSection />
      <ProblemSolutionSection />
      <FeaturesShowcase />
      <HowItWorks />
      <SuccessMetrics />
      <OpenSourceShowcase />
      <FinalCTA />
    </div>
  )
}