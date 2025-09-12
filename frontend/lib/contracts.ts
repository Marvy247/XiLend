import { Address } from 'viem';

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  LendingPool: '0x5007176BA61e1C9edc0C1ABf1735B11Ef33C40b0' as Address,
  CollateralManager: '0x51f4FaaF35a810b91B758B0968258aE852764E05' as Address,
  InterestRateModel: '0x54749f9F53d184D65f55dC7856cBdb7BdbD37B21' as Address,
  PriceOracle: '0xd3cCC5aB56f930249263A79C3af100C3B38ef9eF' as Address,
  MockUSDC: '0x1C766e77b378C56398842832CcBF805CE8E86c61' as Address,
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

// CollateralManager ABI
export const COLLATERAL_MANAGER_ABI = [
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'asset', type: 'address' },
    ],
    name: 'userCollateral',
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
