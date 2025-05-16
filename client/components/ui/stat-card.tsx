import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StatCardProps {
  icon: string
  label: string
  value: string
  subValue: string
  color: string
}

export function StatCard({ icon, label, value, subValue, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      <Avatar className="w-12 h-12 mb-2">
        <AvatarImage src={icon} alt={label} />
        <AvatarFallback>{label[0]}</AvatarFallback>
      </Avatar>
      <h3 className="text-lg font-bold text-navy-900">{label}</h3>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500">{subValue}</p>
    </motion.div>
  )
}

