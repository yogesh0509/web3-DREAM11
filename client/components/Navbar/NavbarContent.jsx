import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/router'
import { motion } from "framer-motion"

export default function NavbarContent({ dt, dreamToken }) {
    const router = useRouter()
    const { query } = router

    const navItems = dt
        ? [
            { href: "/", label: "HOME" },
            { href: `${query.gameAddress}/leaderboard`, label: "LEADERBOARD" },
          ]
        : [
            { href: "/", label: "HOME" },
            { href: "#howtoplay", label: "HOW TO PLAY" },
            { href: "/", label: "CONTESTS" },
            { href: "#faqs", label: "FAQ" },
          ]

    return (
        <>
            {navItems.map((item) => (
                <motion.div
                    key={item.href}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link
                        href={item.href}
                        scroll={true}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                        {item.label}
                    </Link>
                </motion.div>
            ))}
            {dt && (
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2"
                >
                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                        {dreamToken}
                    </span>
                    <Image 
                        src="/assets/currency.png" 
                        alt="currency" 
                        width={32} 
                        height={32} 
                        className="w-8 h-8"
                    />
                </motion.div>
            )}
        </>
    )
}

