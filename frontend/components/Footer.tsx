'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Github,
  Twitter,
  DiscIcon as Discord,
  ExternalLink,
  Heart,
  Shield,
  BookOpen,
  MessageCircle
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Dashboard', href: '#dashboard' },
      { name: 'Deposit', href: '#deposit' },
      { name: 'Borrow', href: '#borrow' },
      { name: 'Repay', href: '#repay' }
    ],
    resources: [
      { name: 'Documentation', href: '#docs', icon: BookOpen },
      { name: 'Security', href: '#security', icon: Shield },
      { name: 'FAQ', href: '#faq', icon: MessageCircle },
      { name: 'Support', href: '#support', icon: ExternalLink }
    ],
    community: [
      { name: 'GitHub', href: 'https://github.com', icon: Github, external: true as const },
      { name: 'Twitter', href: 'https://twitter.com', icon: Twitter, external: true as const },
      { name: 'Discord', href: 'https://discord.com', icon: Discord, external: true as const }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' }
    ]
  };

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 py-12 max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                XiLend
              </span>
            </div>

            <p className="text-sm text-muted-foreground max-w-md">
              Decentralized lending protocol on Ethereum. Earn interest on your deposits
              and borrow against your collateral with competitive rates and maximum security.
            </p>

            <div className="flex space-x-2">
              {footerLinks.community.map((link) => (
                <Button
                  key={link.name}
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 hover:bg-accent/50 transition-colors"
                  asChild
                >
                  <a
                    href={link.href}
                    target={'external' in link && link.external ? '_blank' : undefined}
                    rel={'external' in link && link.external ? 'noopener noreferrer' : undefined}
                    aria-label={link.name}
                  >
                    <link.icon className="h-4 w-4 text-foreground" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground hover:bg-transparent justify-start"
                    onClick={() => {
                      const element = document.querySelector(link.href);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {link.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground hover:bg-transparent justify-start"
                    asChild
                  >
                    <a
                      href={link.href}
                      className="flex items-center space-x-2"
                      target={'external' in link && link.external ? '_blank' : undefined}
                      rel={'external' in link && link.external ? 'noopener noreferrer' : undefined}
                    >
                      <link.icon className="h-3 w-3 text-foreground" />
                      <span>{link.name}</span>
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground hover:bg-transparent justify-start"
                    onClick={() => {
                      const element = document.querySelector(link.href);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {link.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground">
            <p>© {currentYear} XiLend. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span>Built on Ethereum</span>
              <span>•</span>
              <span>Testnet: Sepolia</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-foreground" />
              <span>Audited</span>
            </span>
            <span>•</span>
            <span>v1.0.0</span>
          </div>
        </div>

        {/* Newsletter Signup (Optional) */}
        <div className="mt-8 pt-8 border-t">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-sm font-semibold mb-2">Stay Updated</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Get the latest updates on XiLend protocol developments and features.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
              />
              <Button size="sm" className="px-4">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
