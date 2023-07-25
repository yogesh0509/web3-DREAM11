import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/router'

export default function NavbarContent({ dt, dreamToken }) {
    const router = useRouter()
    const { query } = router

    return (
        <>
            <Link
                href="/"
                scroll={true}
                className="hover:scale-105 transition duration-300"
            >
                HOME
            </Link>
            {dt
                ?
                <>
                    <Link
                        href= {`${query.gameAddress}/leaderboard`}
                        scroll
                        className="hover:scale-105 transition duration-300"
                    >
                        LEADERBOARD
                    </Link>
                    <div className="hover:scale-105 transition duration-300 font-extrabold text-transparent bg-clip-text bg-[#C69749] inline-block" >
                        {dreamToken}
                        <Image src="/assets/currency.png" alt="currency" width="200" height={200} className="inline-block w-8 h-8" />
                    </div>
                </>
                :
                <>
                    <Link
                        href="#howtoplay"
                        scroll
                        className="hover:scale-105 transition duration-300"
                    >
                        HOW TO PLAY
                    </Link>
                    <Link
                        href="/"
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
        </>
    )
}