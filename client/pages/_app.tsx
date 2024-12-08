import React, { useEffect, useState } from "react"
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Head from 'next/head'
import '../styles/globals.css'
import "@rainbow-me/rainbowkit/styles.css"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from "wagmi"
import { Toaster } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
// import { initializeApp } from 'firebase/app'
// import { getDatabase } from 'firebase/database'
import { MyProvider } from "../context/ContractContext"
import Navbar from "../components/Navbar/Navbar"
import { config } from "../config"
import { firebaseConfig } from "../constants/firebaseConfig"

// Initialize Firebase
// const app = initializeApp(firebaseConfig)
// const database = getDatabase(app)

const queryClient = new QueryClient()

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const shouldRenderNavbar = router.pathname !== '/'

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  return (
    <MyProvider>
      <Head>
        <title>Dream11 - Test your knowledge & earn real money</title>
        <meta name="description" content="Dream11 - The ultimate fantasy sports platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider modalSize="compact">
            <div className="min-h-screen bg-gray-900 text-white">
              <Toaster position="top-center" reverseOrder={false} />
              {shouldRenderNavbar ? <Navbar dt={true} className={undefined} /> : <Navbar className={undefined} dt={undefined} />}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-screen w-screen justify-center items-center"
                  >
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="page"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Component {...pageProps} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MyProvider>
  )
}

