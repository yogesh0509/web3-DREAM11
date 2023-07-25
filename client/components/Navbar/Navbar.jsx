import React, { useEffect, useState, useContext } from "react"
import Image from "next/image"
import Link from "next/link"
import ConnectWallet from "../Button/ConnectWallet"
import { createTheme, ThemeProvider, Drawer } from '@mui/material'
import { grey } from '@mui/material/colors'
import { ContractContext } from "../../context/ContractContext"
import NavbarContent from "./NavbarContent"

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: grey[900],
    },
    background: {
      default: grey[900],
    },
  },
});

const Navbar = ({ className, dt }) => {
  const [show, setScroll] = useState("")
  const [link, setLink] = useState("text-white")
  const [open, setOpen] = useState(false)
  // const [lastScrollY, setLastScrollY] = useState(0)
  const { dreamToken } = useContext(ContractContext)

  // const handleScroll = () => {
  //   if (window.scrollY > 150) {
  //     setScroll("top-0 bg-white text-black shadow-md transalate-y-0")
  //     setLink("text-black")
  //   } else {
  //     setScroll("bg-transparent transalate-y-0 text-white")
  //     setLink("text-white")
  //   }
  //   setLastScrollY(window.scrollY)
  // }
  // useEffect(() => {
  //   window.addEventListener("scroll", handleScroll)
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll)
  //   }
  // }, [lastScrollY])

  return (
    <nav
      className={`w-screen h-[50px] md:h-[80px] z-20 sticky transition-transform duration-700 flex justify-between items-center bg-black ${link} ${show} ${className}`}
    >
      <div className="w-full max-w-[1380px] px-7 font-proxima mx-auto h-[60px] flex justify-between items-center text-xl py-3 ">
        <Link href={"/"}>
          <Image
            src="/assets/logo.png"
            alt="logo"
            width="200"
            height={200}
            className="w-14 h-14"
          />
        </Link>
        <div className="hidden md:flex justify-between basis-[55%] font-proxima text-xl">
          <NavbarContent dt={dt} dreamToken={dreamToken} />
        </div>

        <section className="flex">
          <div>
            <ConnectWallet />
          </div>
        </section>

        {/* Add responsive navbar button for smaller screens */}
        <div className="md:hidden">
          <button
            className="text-white focus:outline-none"
            onClick={() => setOpen(true)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        {/* Render responsive drawer for smaller screens */}
        <ThemeProvider theme={darkTheme}>
          <Drawer
            anchor="right"
            open={open}
            onClose={() => setOpen(false)}
            classes={{
              paper: 'drawer-paper',
            }}
          >
            <div className="flex flex-col items-start py-4 space-y-4 pl-4 pr-8 font-proxima text-xl">
              <NavbarContent dt={dt} dreamToken={dreamToken} />
            </div>
          </Drawer>
        </ThemeProvider>
      </div>
    </nav>
  )
}

export default Navbar
