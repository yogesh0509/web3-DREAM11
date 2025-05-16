import React, { useState, useContext } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu } from 'lucide-react'
import { ContractContext } from "../../context/ContractContext"
import ConnectWallet from "../Button/ConnectWallet"
import NavbarContent from "./NavbarContent"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  className?: string;
  dt?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ className = "", dt = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { dreamToken } = useContext(ContractContext) || {}

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={`w-full h-16 md:h-20 z-50 fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="w-full max-w-7xl px-4 mx-auto h-full flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            DREAM11
          </span>
        </Link>

        <div className="hidden md:flex justify-between items-center space-x-8 text-sm">
          <NavbarContent dt={dt} dreamToken={String(dreamToken)} />
        </div>

        <div className="flex items-center space-x-4">
          <ConnectWallet />

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-gray-700/50">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gray-900/95 backdrop-blur-sm text-white border-l border-gray-700/50">
              <div className="flex flex-col space-y-6 mt-8">
                <NavbarContent dt={dt} dreamToken={String(dreamToken)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar

