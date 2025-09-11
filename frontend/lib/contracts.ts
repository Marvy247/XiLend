import { Address } from 'viem';

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  LendingPool: '0x3D7aed88268dc8a8B775621d32d923b0298Ea7AC' as Address,
  CollateralManager: '0x7Ee63284bF00e5b7cC8857d5238F29875949B08c' as Address,
  InterestRateModel: '0x21d0C336724053a628a69544D19D4726e5aEf17B' as Address,
  PriceOracle: '0x5C8E7eBD3BB9359A66Cc6C7A980c4698731bF1FE' as Address,
  MockUSDC: '0x5eCd84C67Ec2997D11764Dfa998B1FA31979A963' as Address,
} as const;

// LendingPool ABI (simplified for main functions)
export const LENDING_POOL_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserAccountData',
    outputs: [
      { name: 'totalCollateralETH', type: 'uint256' },
      { name: 'totalDebtETH', type: 'uint256' },
      { name: 'availableBorrowsETH', type: 'uint256' },
      { name: 'currentLiquidationThreshold', type: 'uint256' },
      { name: 'ltv', type: 'uint256' },
      { name: 'healthFactor', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
      { name: 'useAsCollateral', type: 'bool' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'interestRateMode', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
    ],
    name: 'borrow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
    ],
    name: 'repay',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'reserve', type: 'address' },
      { indexed: false, name: 'user', type: 'address' },
      { indexed: true, name: 'onBehalfOf', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: true, name: 'referralCode', type: 'uint16' },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'reserve', type: 'address' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Withdraw',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'reserve', type: 'address' },
      { indexed: false, name: 'user', type: 'address' },
      { indexed: true, name: 'onBehalfOf', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'interestRateMode', type: 'uint256' },
      { indexed: false, name: 'borrowRate', type: 'uint256' },
      { indexed: true, name: 'referralCode', type: 'uint16' },
    ],
    name: 'Borrow',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'reserve', type: 'address' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'repayer', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Repay',
    type: 'event',
  },
] as const;

export const PRICE_ORACLE_ABI = [
  {
    inputs: [{ name: 'asset', type: 'address' }],
    name: 'getPrice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ERC20 ABI for token interactions
export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;