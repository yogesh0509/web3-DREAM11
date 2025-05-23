# DREAM11 - Blockchain Fantasy Sports Platform

A decentralized fantasy sports platform built on blockchain technology where users can participate in fantasy sports using NFTs and smart contracts.

## 🌟 Features

- **Real-time Player Auctions**: Bid on players using smart contracts
- **Automated Winner Determination**: Chainlink Functions integration for fair and transparent winner selection
- **Dynamic Leaderboard**: Real-time updates of team scores and rankings
- **Secure Wallet Integration**: MetaMask and RainbowKit support
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Updates**: Live updates for game status and player auctions

## 🛠 Tech Stack

- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Web3 Integration**: 
  - wagmi
  - RainbowKit
  - ethers.js
- **State Management**: React Context
- **Notifications**: react-hot-toast
- **UI Components**: Custom components with shadcn/ui

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MetaMask or any Web3 wallet
- ETH tokens for transactions

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dream11.git
cd dream11
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_GAME_FACTORY_CONTRACT_ADDRESS=your_contract_address
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── components/          # Reusable UI components
│   ├── Button/         # Button components
│   ├── Card/           # Card components
│   ├── Navbar/         # Navigation components
│   └── ui/             # UI components (shadcn)
├── config/             # Configuration files
├── constants/          # Contract ABIs and constants
├── context/            # React Context providers
├── pages/              # Next.js pages
│   ├── contests/       # Contest-related pages
│   ├── _app.tsx        # App wrapper
│   └── index.jsx       # Home page
├── public/             # Static assets
├── styles/             # Global styles
└── utils/              # Utility functions
```

## 🎮 How to Play

1. **Connect Wallet**: Install MetaMask and connect your wallet
2. **Browse Contests**: View available fantasy sports contests
3. **Register**: Pay the registration fee to join a contest
4. **Build Team**: Bid on players in real-time auctions
5. **Monitor**: Track your team's performance on the leaderboard
6. **Win**: Claim your rewards if you win!

## 🔒 Security

- Smart contract interactions are handled securely through wagmi
- Private keys are never stored or transmitted
- All transactions require explicit user approval
- Chainlink Functions ensure fair and transparent winner determination

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [RainbowKit](https://www.rainbowkit.com/)
- [wagmi](https://wagmi.sh/)
- [Chainlink](https://chain.link/)
