"use client";

import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-4 z-50 flex justify-center w-full px-3">
      <nav className="w-[95%] max-w-7xl bg-white/90 backdrop-blur-md shadow-xl rounded-2xl">

        {/* Top Section */}
        <div className="flex items-center justify-between px-6 py-4">

          {/* Logo */}
          <div className="text-xl font-bold">
            <span className="text-black">VIDEO</span>{" "}
            <span className="text-blue-500">DOWNLOADER</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 text-gray-600 font-medium">
            <a href="#" className="hover:text-blue-500 transition">
              YouTube
            </a>
            <a href="#" className="hover:text-blue-500 transition">
              Instagram
            </a>
            <a href="#" className="hover:text-blue-500 transition">
              TikTok
            </a>
          </div>

          {/* Mobile Button */}
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>

        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            open ? "max-h-40" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-3 px-6 pb-4 text-gray-700">
            <a href="#" className="hover:text-blue-500 transition">
              YouTube
            </a>
            <a href="#" className="hover:text-blue-500 transition">
              Instagram
            </a>
            <a href="#" className="hover:text-blue-500 transition">
              TikTok
            </a>
          </div>
        </div>

      </nav>
    </div>
  );
}