import React from "react"
import { useRouter } from 'next/router'
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface PlayerCardProps {
  image: string
  id: number
  role: string
  name: string
  currentPlayer: number
}

export default function PlayerCard({ image, id, role, name, currentPlayer }: PlayerCardProps) {
  const router = useRouter()
  const { query } = router

  const handlePlayerDetails = () => {
    router.push(`${query.gameAddress}/player-details/${id}`)
  }

  const isSoldOut = id < currentPlayer

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: id * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <button 
        onClick={handlePlayerDetails}
        className="w-full text-left focus:outline-none"
      >
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors duration-300">
          <div className="relative aspect-square">
            <img
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={image.replace("ipfs://", "https://ipfs.io/ipfs/") + "/" + name.split(' ').join('%20') + ".png"}
              alt={`${name} NFT`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-white">
                {name.toUpperCase()}
              </h3>
              <Badge 
                variant={isSoldOut ? "destructive" : "default"}
                className={`
                  ${isSoldOut 
                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                    : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
                  }
                `}
              >
                {isSoldOut ? "SOLD OUT" : "AVAILABLE"}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">
                {role.toUpperCase()}
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-4 py-1 rounded-full text-sm font-medium
                  ${isSoldOut 
                    ? 'bg-red-500/10 text-red-500' 
                    : 'bg-purple-500 text-white'
                  }
                `}
              >
                {isSoldOut ? "VIEW DETAILS" : "BID NOW"}
              </motion.div>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  )
}

