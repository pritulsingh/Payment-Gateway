"use client"

import { Button } from "./ui/button"
import { ArrowRight, Github } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Blockchain network"
          fill
          className="object-cover opacity-20"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            MorphPay SDK
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
            The most developer-friendly Web3 payment solution for the Morph blockchain. Accept ETH and ERC-20 tokens
            with just a few lines of code.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
              <Link href="#demo" className="flex items-center">
                Try Live Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4 bg-transparent"
              onClick={() => window.open("https://github.com/pritulsingh", "_blank")}
            >
              <Github className="mr-2 w-5 h-5" />
              View on GitHub
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{"<5min"}</div>
              <div className="text-gray-300">Integration Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">0.5%</div>
              <div className="text-gray-300">Transaction Fee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-gray-300">Decentralized</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}