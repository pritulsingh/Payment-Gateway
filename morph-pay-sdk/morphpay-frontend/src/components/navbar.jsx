"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "./ui/button"
import { Menu, X, Github } from "lucide-react"
import WalletConnectButton from "./wallet-connect-button"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false) 
    }
  }

  const handleGitHubClick = () => {
    window.open("https://github.com/pritulsingh", "_blank", "noopener,noreferrer")
  }

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MorphPay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('demo')}
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Demo
            </button>
            <button 
              onClick={() => scrollToSection('integration')}
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Integration
            </button>
            <button 
              onClick={() => scrollToSection('documentation')}
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Documentation
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleGitHubClick}>
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <WalletConnectButton size="sm" />
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-gray-900 transition-colors text-left"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('demo')}
                className="text-gray-600 hover:text-gray-900 transition-colors text-left"
              >
                Demo
              </button>
              <button 
                onClick={() => scrollToSection('integration')}
                className="text-gray-600 hover:text-gray-900 transition-colors text-left"
              >
                Integration
              </button>
              <button 
                onClick={() => scrollToSection('documentation')}
                className="text-gray-600 hover:text-gray-900 transition-colors text-left"
              >
                Documentation
              </button>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start"
                  onClick={handleGitHubClick}
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                <WalletConnectButton size="sm" className="justify-start" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}