'use client';

import { useState } from 'react';
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
      href: '#dashboard',
      description: 'View your lending positions'
    },
    {
      name: 'Deposit',
      icon: TrendingUp,
      href: '#deposit',
      description: 'Add collateral to earn interest'
    },
    {
      name: 'Borrow',
      icon: Zap,
      href: '#borrow',
      description: 'Borrow against your collateral'
    },
    {
      name: 'Security',
      icon: Shield,
      href: '#security',
      description: 'Learn about our security measures'
    },
    {
      name: 'Help',
      icon: HelpCircle,
      href: '#help',
      description: 'Get help and support'
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-full flex h-16 items-center justify-between px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
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
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.slice(0, 4).map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 hover:bg-accent/50 transition-colors"
              onClick={() => {
                const element = document.querySelector(item.href);
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
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
                      onClick={() => {
                        const element = document.querySelector(item.href);
                        element?.scrollIntoView({ behavior: 'smooth' });
                        setIsMenuOpen(false);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <item.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </div>
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
                    <a href="#" className="hover:text-foreground transition-colors">
                      Documentation
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
