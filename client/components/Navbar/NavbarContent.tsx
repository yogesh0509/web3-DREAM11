import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/router'
import { motion } from "framer-motion"

interface NavbarContentProps {
  dt?: boolean;
  dreamToken?: string;
}

const NavbarContent: React.FC<NavbarContentProps> = ({ dt = false, dreamToken }) => {
  const router = useRouter()
  const { query } = router

  const navItems = dt
    ? [
        { href: "/", label: "HOME" },
        { href: `${query.gameAddress}/leaderboard`, label: "LEADERBOARD" },
      ]
    : [
        { href: "/", label: "HOME" },
        { href: "/how-to-play", label: "HOW TO PLAY" },
        { href: "/", label: "CONTESTS" },
        { href: "/faq", label: "FAQ" },
      ]

  return (
    <>
      {navItems.map((item) => (
        <motion.div
          key={item.href}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          <Link
            href={item.href}
            scroll={true}
            className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-700/50"
          >
            {item.label}
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
          </Link>
        </motion.div>
      ))}
      {dt && dreamToken && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-full"
        >
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            {dreamToken}
          </span>
          <Image 
            src="/assets/currency.png" 
            alt="currency" 
            width={24} 
            height={24} 
            className="w-6 h-6"
          />
        </motion.div>
      )}
    </>
  )
}

export default NavbarContent

