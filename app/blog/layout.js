import Link from 'next/link'
import { MessageCircle, BookOpen, ArrowRight } from 'lucide-react'

const LOGO_URL = '/grofience-logo.png'

export default function BlogLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src={LOGO_URL} alt="Grofience" className="h-10 w-auto object-contain" />
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/blog" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5">Blog</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/?text=Hi%20Grofience!%20I%20want%20to%20know%20more%20about%20the%20teen%20financial%20literacy%20program."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              WhatsApp Us
            </a>
            <Link href="/">
              <button className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-sm transition-all transform hover:-translate-y-0.5">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="text-slate-500 py-12 px-4 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Grofience" className="h-9 w-auto object-contain" />
              <div>
                <div className="text-slate-800 font-extrabold text-sm">Grofience Blog</div>
                <div className="text-xs text-slate-500">Financial Literacy for Indian Teens</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
              <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
              <a href="/#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
              <a href="/#contact" className="hover:text-slate-900 transition-colors">Contact</a>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Grofience. All rights reserved. Built with ❤️ for Indian teenagers.
          </div>
        </div>
      </footer>
    </div>
  )
}
