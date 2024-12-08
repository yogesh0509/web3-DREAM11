import { motion } from "framer-motion"

export function FloatingOrbs() {
  return (
    <>
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute left-0 bottom-0 w-32 h-48"
      >
        <div className="absolute w-4 h-4 rounded-full bg-pink-300/50 left-8 top-12" />
        <div className="absolute w-6 h-6 rounded-full bg-blue-300/50 left-16 top-24" />
        <div className="absolute w-5 h-5 rounded-full bg-pink-200/50 left-4 top-32" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute right-0 top-0 w-32 h-48"
      >
        <div className="absolute w-4 h-4 rounded-full bg-blue-300/50 right-8 top-12" />
        <div className="absolute w-6 h-6 rounded-full bg-pink-300/50 right-16 top-24" />
        <div className="absolute w-5 h-5 rounded-full bg-blue-200/50 right-4 top-32" />
      </motion.div>
    </>
  )
}

