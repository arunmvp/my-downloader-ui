"use client"

import { useState } from "react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"

export default function Navbar() {

 const [open,setOpen] = useState(false)

 return (
  <nav className="w-full border-b bg-white">
   <div className="max-w-6xl mx-auto flex items-center justify-between p-4">

    <div className="text-xl font-bold">
     <span className="text-black">VIDEO</span>{" "}
     <span className="text-blue-500">DOWNLOADER</span>
    </div>

    <div className="hidden md:flex gap-6 text-gray-600">
     <a href="#">YouTube</a>
     <a href="#">Instagram</a>
     <a href="#">TikTok</a>
    </div>

    <button
     className="md:hidden"
     onClick={()=>setOpen(!open)}
    >
     {open ? <XMarkIcon className="w-6"/> : <Bars3Icon className="w-6"/>}
    </button>

   </div>

   <div
    className={`md:hidden overflow-hidden transition-all duration-300 ${
     open ? "max-h-40" : "max-h-0"
    }`}
   >
    <div className="flex flex-col p-4 gap-2">
     <a href="#">YouTube</a>
     <a href="#">Instagram</a>
     <a href="#">TikTok</a>
    </div>
   </div>

  </nav>
 )
}