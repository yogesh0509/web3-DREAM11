import React from "react";

export default function ContestCard() {
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:w-48"
              src="contest-image.jpg"
              alt="Contest Image"
            />
          </div>
          <div className="p-4">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              Contest
            </div>
            <a href="#" className="block mt-1 text-lg leading-tight font-medium text-white hover:underline">
              Contest Title
            </a>
            <p className="mt-2 text-gray-300">
              Contest Description
            </p>
            <div className="mt-4">
              <span className="inline-block bg-indigo-600 rounded-full px-3 py-1 text-sm font-semibold text-white mr-2">
                Category
              </span>
              <span className="inline-block bg-indigo-600 rounded-full px-3 py-1 text-sm font-semibold text-white">
                Duration
              </span>
            </div>
            <div className="mt-4">
              <span className="text-gray-400">
                Start Date:
              </span>
              <span className="text-white ml-2">
                Contest Start Date
              </span>
            </div>
            <div className="mt-2">
              <span className="text-gray-400">
                End Date:
              </span>
              <span className="text-white ml-2">
                Contest End Date
              </span>
            </div>
            <div className="mt-4">
              <a href="#" className="text-indigo-600 hover:text-indigo-400 font-medium">
                Learn More
              </a>
            </div>
            <div className="mt-4">
              <button className="bg-indigo-600 hover:bg-indigo-400 text-white font-medium py-2 px-4 rounded">
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};