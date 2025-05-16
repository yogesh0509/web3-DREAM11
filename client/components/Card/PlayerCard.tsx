import React from "react"
import { useRouter } from "next/router"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface Status {
  status: "AUCTIONED" | "CURRENT" | "UPCOMING"
  label: string
  color: string // example: "bg-green-500/20 text-green-400"
}

interface PlayerCardProps {
  image: string
  id: number
  role: string
  name: string
  currentPlayer: number
  status: Status
  className?: string
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  image,
  id,
  role,
  name,
  currentPlayer,
  status,
  className,
}) => {
  const router = useRouter()
  const { query } = router

  const handlePlayerDetails = () => {
    router.push(`${query.gameAddress}/player-details/${id}`)
  }

  const isSoldOut = id < currentPlayer

  // Format the image URL properly
  const getImageUrl = () => {
    if (!image) return "/assets/placeholder.png";
    
    if (image.startsWith("ipfs://")) {
      // Extract CID and convert to IPFS gateway URL
      const ipfsPath = image.replace("ipfs://", "");
      return `https://ipfs.io/ipfs/${ipfsPath}`;
    }
    
    return image; // Return as is if it's already a HTTP URL
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (id % 10) * 0.05 }} // Use modulo to limit delay
      whileHover={{ scale: 1.02 }}
      className={cn("group cursor-pointer", className)}
      onClick={handlePlayerDetails}
    >
      <Card className="bg-gray-800 border border-gray-700 overflow-hidden group hover:shadow-xl transition-shadow duration-300 rounded-2xl">
        <CardContent className="p-0 relative aspect-[3/4]">
          {/* Background blend */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-600/90 opacity-75 group-hover:opacity-90 transition-opacity duration-300 rounded-2xl" />
          
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={getImageUrl()}
              alt={name}
              fill
              className="object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-300 rounded-2xl"
              unoptimized
              onError={(e) => {
                // Fallback to a placeholder if image fails to load
                console.error("Error loading player image:", image);
                const target = e.target as HTMLImageElement;
                target.src = "/assets/placeholder.png";
              }}
            />
          </div>

          {/* Top Section */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
            <div className="flex flex-col space-y-2 bg-black/30 rounded-lg p-3 backdrop-blur-sm">
              <Badge className={cn(status.color)}>
                {status.label}
              </Badge>
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                {name.toUpperCase()}
              </h3>
              <p className="text-gray-300 text-sm">{role}</p>
            </div>

            {/* Bottom Section */}
            <div className="flex justify-between items-center bg-black/30 rounded-lg p-3 backdrop-blur-sm mt-2">
              <p className="text-white font-medium text-sm">
                Player #{id}
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  isSoldOut
                    ? "bg-red-500/10 text-red-400"
                    : "bg-purple-500/20 text-purple-400"
                )}
              >
                {isSoldOut ? "SOLD OUT" : "BID NOW"}
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
