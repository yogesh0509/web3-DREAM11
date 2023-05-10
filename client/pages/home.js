import React from "react";

export default function CompetitionCard ({ gameTitle, gameImage, date, time, entryFee, prizeMoney, playersCount}) {
  return (
    <div className="mx-auto my-4 w-full md:w-2/3 lg:w-1/2">
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <img className="w-full h-40 md:h-48 lg:h-56 object-cover object-center" src={gameImage} alt={gameTitle} />
        <div className="p-4 md:p-6 lg:p-8">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800">{gameTitle}</h2>
          <p className="mt-2 text-base md:text-lg text-gray-600">Date: {date}</p>
          <p className="mt-1 text-base md:text-lg text-gray-600">Time: {time}</p>
          <p className="mt-1 text-base md:text-lg text-gray-600">Entry Fee: ${entryFee}</p>
          <p className="mt-1 text-base md:text-lg text-gray-600">Prize Money: ${prizeMoney}</p>
          <p className="mt-1 text-base md:text-lg text-gray-600">{playersCount} players</p>
          <div className="mt-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export async function getServerSideProps(context) {
    return {
        props: {

          gameImage: "https://example.com/competition1.jpg",
            gameTitle: "Example Competition 1",
            date: "May 15, 2023",
            time: "2:00 PM",
            entryFee: "$100",
            prizeMoney: "$1000",
            playersCount: "10"
        }
    }
}