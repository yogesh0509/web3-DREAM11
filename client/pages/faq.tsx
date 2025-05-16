import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "What is a blockchain fantasy sports platform?",
    answer: "It's a decentralized platform where users can participate in fantasy sports using blockchain technology. Players are represented as NFTs, and auctions are conducted on-chain using smart contracts."
  },
  {
    question: "How do I get started?",
    answer: "First, install MetaMask and create a wallet. Then, get some ETH tokens for transactions. Finally, browse available contests and register for one that interests you."
  },
  {
    question: "What is ETH and why do I need it?",
    answer: "ETH is the native cryptocurrency of the Polygon network. You need it to pay for transaction fees and participate in player auctions on our platform."
  },
  {
    question: "How do player auctions work?",
    answer: "Each player has a fixed auction duration. Users can place bids, and the highest bidder at the end of the auction wins the player. Each bid must be higher than the previous one by a minimum increment."
  },
  {
    question: "How are rewards distributed?",
    answer: "Rewards are distributed based on your team's performance. The better your team performs, the larger your share of the prize pool. Rewards are autoETHally distributed through smart contracts."
  },
  {
    question: "Is my wallet secure?",
    answer: "Yes, your wallet is secure as long as you keep your private keys safe. Never share your private keys or seed phrase with anyone. We recommend using hardware wallets for additional security."
  },
  {
    question: "What happens if I lose my wallet?",
    answer: "If you lose access to your wallet and don't have your private keys or seed phrase, you won't be able to recover your funds. Always keep multiple secure backups of your wallet information."
  },
  {
    question: "Can I withdraw my tokens at any time?",
    answer: "Yes, you can withdraw your tokens at any time, but you'll need to pay a small gas fee for the transaction. Make sure you have enough ETH to cover the gas fees."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400">
            Find answers to common questions about our platform
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="bg-gray-800/50 border-gray-700/50 hover:border-gray-600 transition-all duration-300 cursor-pointer"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  {openIndex === index && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 text-gray-400"
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 