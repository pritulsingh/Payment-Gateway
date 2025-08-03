"use client"

import Link from "next/link"
import { Github, Twitter, MessageCircle } from "lucide-react"

export default function Footer() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleExternalLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold">MorphPay</span>
            </Link>
            <p className="text-gray-400 text-sm">
              The most developer-friendly Web3 payment solution for the Morph blockchain.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => handleExternalLink("https://github.com/pritulsingh")}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleExternalLink("https://twitter.com")}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleExternalLink("https://discord.com")}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="hover:text-white transition-colors text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('demo')}
                  className="hover:text-white transition-colors text-left"
                >
                  Live Demo
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('integration')}
                  className="hover:text-white transition-colors text-left"
                >
                  Integration
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="hover:text-white transition-colors text-left"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h3 className="font-semibold mb-4">Developers</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button 
                  onClick={() => scrollToSection('docs')}
                  className="hover:text-white transition-colors text-left"
                >
                  Documentation
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleExternalLink("https://docs.morphpay.dev/api")}
                  className="hover:text-white transition-colors text-left"
                >
                  API Reference
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleExternalLink("https://github.com/pritulsingh/morphpay-examples")}
                  className="hover:text-white transition-colors text-left"
                >
                  Examples
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleExternalLink("https://github.com/pritulsingh")}
                  className="hover:text-white transition-colors text-left"
                >
                  GitHub
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button 
                  onClick={() => handleExternalLink("https://help.morphpay.dev")}
                  className="hover:text-white transition-colors text-left"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleExternalLink("https://discord.gg/morphpay")}
                  className="hover:text-white transition-colors text-left"
                >
                  Discord
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleExternalLink("mailto:support@morphpay.dev")}
                  className="hover:text-white transition-colors text-left"
                >
                  Contact
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleExternalLink("https://status.morphpay.dev")}
                  className="hover:text-white transition-colors text-left"
                >
                  Status
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 MorphPay. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button 
              onClick={() => handleExternalLink("/privacy")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => handleExternalLink("/terms")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}