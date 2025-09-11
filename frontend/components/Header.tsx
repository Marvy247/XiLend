'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  HelpCircle,
  Settings
} from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      href: '/',
      external: false,
      description: 'View your lending positions'
    },
    {
      name: 'Docs',
      icon: HelpCircle,
      href: 'https://docs.xilend.com', // Placeholder
      external: true,
      description: 'Read our documentation'
    },
    {
      name: 'Security',
      icon: Shield,
      href: 'https://docs.xilend.com/security', // Placeholder
      external: true,
      description: 'Learn about our security measures'
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-full flex h-16 items-center justify-between px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                XiLend
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Decentralized Lending
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined} className="flex items-center space-x-2 hover:bg-accent/50 transition-colors">
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </Button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* Wallet Connection */}
          <div className="hidden sm:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-6 mt-6">
                {/* Mobile Wallet Connection */}
                <div className="sm:hidden">
                  <ConnectButton />
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-4">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className="justify-start h-auto p-4 hover:bg-accent/50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                      asChild
                    >
                      <Link href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined}>
                        <div className="flex items-start space-x-3">
                          <item.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                          <div className="text-left">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Button>
                  ))}
                </nav>

                {/* Mobile Footer Links */}
                <div className="border-t pt-4">
                  <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-foreground transition-colors">
                      Privacy Policy
                    </a>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Terms of Service
                    </a>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}