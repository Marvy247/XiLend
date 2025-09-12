# XiLend

A decentralized lending protocol built on Ethereum, enabling users to deposit assets as collateral, borrow against them, and manage their positions with real-time health factor monitoring.

## Features

- **Deposit Assets**: Deposit ERC-20 tokens as collateral to earn interest and borrow against them
- **Borrow Against Collateral**: Borrow assets using your deposited collateral with configurable loan-to-value (LTV) ratios
- **Repay Loans**: Repay borrowed assets with automatic interest calculation
- **Withdraw Assets**: Withdraw deposited collateral while maintaining healthy position ratios
- **Liquidation Protection**: Real-time health factor monitoring with liquidation warnings
- **Transaction History**: Complete history of all lending activities
- **Reminders**: Set custom reminders for loan repayments and position management
- **Multi-Asset Support**: Support for multiple ERC-20 tokens with price oracles
- **Dark Mode**: Modern UI with dark/light theme support
- **Wallet Integration**: Seamless connection with MetaMask, WalletConnect, and other Web3 wallets

## Tech Stack

### Smart Contracts
- **Solidity**: ^0.8.20
- **Foundry**: Development framework for testing and deployment
- **OpenZeppelin**: Secure, audited smart contract libraries

### Frontend
- **Next.js**: 15.5.2 (React framework)
- **React**: 19.1.0
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component library
- **Wagmi/Viem**: Ethereum interaction libraries
- **RainbowKit**: Wallet connection interface

## Prerequisites

- **Node.js**: >= 18.0.0
- **npm** or **yarn** or **pnpm**
- **Foundry**: For smart contract development
- **Git**: Version control

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd XiLend
   ```

2. **Install smart contract dependencies**
   ```bash
   cd contracts
   forge install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Setup

### Smart Contracts

1. **Configure Foundry**
   ```bash
   cd contracts
   # Copy and modify foundry.toml if needed
   ```

2. **Set up environment variables**
   Create a `.env` file in the `contracts` directory with:
   ```
   PRIVATE_KEY=your_private_key
   RPC_URL=https://sepolia.infura.io/v3/your_infura_key
   ```

### Frontend

1. **Configure environment**
   Create a `.env.local` file in the `frontend` directory with:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   NEXT_PUBLIC_INFURA_ID=your_infura_project_id
   ```

2. **Update contract addresses**
   Update `frontend/lib/contracts.ts` with deployed contract addresses.

## Running the Application

### Smart Contracts

1. **Compile contracts**
   ```bash
   cd contracts
   forge build
   ```

2. **Run tests**
   ```bash
   forge test
   ```

3. **Deploy to testnet**
   ```bash
   forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
   ```

### Frontend

1. **Start development server**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing

### Smart Contracts
```bash
cd contracts
forge test
```

### Frontend
```bash
cd frontend
npm run build  # Build check
npm run lint   # Linting
```

## Deployment

### Smart Contracts
The contracts are currently deployed on Sepolia testnet:
- LendingPool: `0x5007176BA61e1C9edc0C1ABf1735B11Ef33C40b0`
- PriceOracle: `0xd3cCC5aB56f930249263A79C3af100C3B38ef9eF`
- InterestRateModel: `0x54749f9F53d184D65f55dC7856cBdb7BdbD37B21`
- CollateralManager: `0x51f4FaaF35a810b91B758B0968258aE852764E05`

### Frontend
```bash
cd frontend
npm run build
npm run start
```

## Project Structure

```
XiLend/
├── contracts/                 # Smart contracts
│   ├── src/
│   │   ├── interfaces/        # Contract interfaces
│   │   ├── logic/            # Core lending logic
│   │   ├── oracles/          # Price oracles
│   │   └── tokens/           # Token contracts
│   ├── test/                 # Contract tests
│   ├── script/               # Deployment scripts
│   └── lib/                  # Dependencies
├── frontend/                 # Next.js application
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and contracts
│   └── public/               # Static assets
└── README.md                 # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

This project is in development and has not been audited. Use at your own risk.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

XiLend is a decentralized protocol. Users interact with it at their own risk. Always do your own research and never invest more than you can afford to lose.
