import React, { useEffect, useState } from "react"
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Head from 'next/head'
import '../styles/globals.css'
import "@rainbow-me/rainbowkit/styles.css"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from "wagmi"
import { Toaster } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { ContractProvider } from "../context/ContractContext"
import Navbar from "../components/Navbar/Navbar"
import { config } from "../config"

const queryClient = new QueryClient()

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const shouldRenderNavbar = !['/', '/how-to-play', '/faq'].includes(router.pathname)

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
    <ContractProvider>
      <Head>
        <title>Blockchain Fantasy Sports | Play & Earn Crypto</title>
        <meta name="description" content="Join the next generation of fantasy sports. Play, compete, and earn crypto rewards." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#7C3AED',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
            })}
            modalSize="compact"
          >
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  style: {
                    background: '#1F2937',
                    color: '#fff',
                    border: '1px solid #374151',
                  },
                }}
              />
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
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="page"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className=" pt-16 md:pt-20">
                      <Component {...pageProps} />
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ContractProvider>
  )
}

