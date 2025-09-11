
import { Chain } from 'viem';

export const sepolia: Chain = {
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://ethereum-sepolia.publicnode.com'] },
    public: { http: ['https://ethereum-sepolia.publicnode.com'] },
  },
  blockExplorers: {
    default: { name: 'Sepolia Explorer', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
};
