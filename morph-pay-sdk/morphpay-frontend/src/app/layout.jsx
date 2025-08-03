import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "../components/navbar"
import Footer from "../components/footer"
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MorphPay SDK - Web3 Payment Solution",
  description:
    "The most developer-friendly Web3 payment solution for the Morph blockchain. Accept ETH and ERC-20 tokens with just a few lines of code.",
  keywords: "Web3, payments, cryptocurrency, Morph, blockchain, SDK, developer tools",
  authors: [{ name: "MorphPay Team" }],
  openGraph: {
    title: "MorphPay SDK - Web3 Payment Solution",
    description: "Accept crypto payments with ease using our developer-friendly SDK",
    type: "website",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <div className="pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
