import React, { useEffect, useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "../Wrapper";
import ConnectWallet from "../Button/ConnectWallet";
import { Drawer } from "@mui/material";
import { ContractContext } from "../../context/ContractContext"

const Navbar = ({ className, dt }) => {
  const [show, setScroll] = useState("");
  const [link, setLink] = useState("text-white");
  const [open, setOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { dreamToken } = useContext(ContractContext);

  const handleScroll = () => {
    if (window.scrollY > 150) {
      setScroll("top-0 bg-white text-black shadow-md transalate-y-0");
      setLink("text-black");
    } else {
      setScroll("bg-transparent transalate-y-0 text-white");
      setLink("text-white");
    }
    setLastScrollY(window.scrollY);
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav
      className={`w-screen h-[50px] md:h-[80px] z-20 sticky transition-transform duration-700 flex justify-between items-center bg-black ${link}  ${show} ${className}`}
    >
      <Wrapper className="h-[60px] flex justify-between items-center text-xl py-3 ">
        <Link href={"/"}>
          <Image
            src="/assets/logo.png"
            alt="logo"
            width="200"
            height={200}
            className="w-14 h-14"
          />
        </Link>
        <div className="hidden md:flex justify-between basis-[55%] font-proxima text-xl ">
          <Link
            href="#home"
            scroll={true}
            className="hover:scale-105 transition duration-300"
          >
            HOME
          </Link>
          <Link
            href="#howtoplay"
            scroll
            className="hover:scale-105 transition duration-300"
          >
            HOW TO PLAY
          </Link>
          {dt
            ?
            <div
              className="hover:scale-105 transition duration-300 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
            >{dreamToken}</div>
            :
            <>
              <Link
                href="#projects"
                scroll
                className="hover:scale-105 transition duration-300"
              >
                CONTESTS
              </Link>
              <Link
                href="#faqs"
                scroll
                className="hover:scale-105 transition duration-300"
              >
                FAQ
              </Link>
            </>
          }
        </div>

        <section className="flex">
          <div
            className="bg-gradient-to-r from-[#4dbc5d] to-[#00a694] hover:scale-95 transition duration-300 px-3 py-2 rounded-lg text-white"
          >
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
        <Drawer
          anchor="right"
          open={open}
          onClose={() => setOpen(false)}
        >
          <div className="flex flex-col items-center py-2 space-y-2">
            <Link
              href="#home"
              scroll={true}
              className="text-black hover:text-gray-300 transition duration-300"
            >
              HOME
            </Link>
            <Link
              href="#howtoplay"
              scroll
              className="text-black hover:text-gray-300 transition duration-300"
            >
              HOW TO PLAY
            </Link>
            <Link
              href="#projects"
              scroll
              className="text-black hover:text-gray-300 transition duration-300"
            >
              CONTESTS
            </Link>
            <Link
              href="#faqs"
              scroll
              className="text-black hover:text-gray-300 transition duration-300"
            >
              FAQ
            </Link>
          </div>
        </Drawer>
      </Wrapper>
    </nav>
  );
};

export default Navbar;
