import { Card, CardContent } from "./ui/card"
import { Wallet, Smartphone, Shield, Zap, Code, Globe } from "lucide-react"

const features = [
  {
    icon: <Wallet className="w-8 h-8" />,
    title: "Multi-Wallet Support",
    description: "Works with MetaMask, WalletConnect, and all major Web3 wallets",
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Mobile QR Payments",
    description: "Generate QR codes for seamless mobile wallet payments",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Secure & Trustless",
    description: "Non-custodial payments with smart contract security",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Lightning Fast",
    description: "Built on Morph L2 for instant, low-cost transactions",
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: "Developer Friendly",
    description: "Simple API with comprehensive documentation and examples",
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Multi-Token Support",
    description: "Accept ETH and any ERC-20 token with automatic conversion",
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose MorphPay?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built for developers who want to integrate Web3 payments without the complexity. Focus on your product while
            we handle the blockchain infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
