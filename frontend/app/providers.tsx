'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit';
import { createConfig, WagmiProvider } from 'wagmi';
import { walletConnect, injected } from 'wagmi/connectors';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sepolia } from './chains';

const projectId = 'cb44e6bd7a2139350e8c0fb2d0fea8cb';

const { connectors } = getDefaultWallets({
  appName: 'XiLend',
  projectId,
});

const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors,
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/H--HtDpZlgQ0zxKBt7zBC-DzXtxGRL0J'),
  },
});

const queryClient = new QueryClient();

function NetworkGuard({ children }: { children: React.ReactNode }) {
  // Removed useNetwork and useSwitchNetwork hooks due to missing exports in wagmi

  // You may want to handle network switching outside this component or via wallet UI

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
          <RainbowKitProvider appInfo={{ appName: 'XiLend' }}>
            {mounted && (
              <NetworkGuard>
                {children}
              </NetworkGuard>
            )}
          </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
