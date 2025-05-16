import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RankColumnProps {
  title: string
  values: string[]
  color: string
  delay?: number
}

export function RankColumn({ title, values, color, delay = 0 }: RankColumnProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative rounded-3xl p-6 backdrop-blur-lg ${color}`}
    >
      <h3 className="text-xl font-bold text-navy-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{index + 1}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

