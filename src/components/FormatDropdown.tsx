"use client"

import {useState,useRef,useEffect} from "react"
import {Format} from "../types/Format"

export default function FormatDropdown({
 formats,
 value,
 onChange
}:{
 formats:Format[]
 value:string
 onChange:(id:string)=>void
}){

 const [open,setOpen] = useState(false)
 const ref = useRef<HTMLDivElement>(null)

 const selected = formats.find(f=>f.formatId===value)

 useEffect(()=>{

  function close(e:MouseEvent){

   if(ref.current && !ref.current.contains(e.target as Node)){
    setOpen(false)
   }

  }

  document.addEventListener("mousedown",close)

  return()=>document.removeEventListener("mousedown",close)

 },[])

 function badge(f:Format){

  if(f.type==="audio") return "AUDIO"
  if(!f.height) return ""

  if(f.height>=2160) return "4K"
  if(f.height>=1440) return "2K"
  if(f.height>=1080) return "HD"

  return ""

 }

 return(

  <div ref={ref} className="relative mt-2">

   <button
    onClick={()=>setOpen(!open)}
    className="w-full border p-3 rounded-[30px] flex justify-between items-center cursor-pointer bg-white"
   >

    {selected?.label || "Select format"}

    <span>▴</span>

   </button>

   {open &&(

    <div className="absolute bottom-full mb-2 w-full bg-white border rounded-[30px] shadow-lg max-h-64 overflow-y-auto z-20">

     {formats.map((f,i)=>(

      <div
       key={i}
       onClick={()=>{

        onChange(f.formatId)
        setOpen(false)

       }}
       className="p-3 flex justify-between items-center hover:bg-gray-100 cursor-pointer"
      >

       <div className="flex gap-2 items-center">

        <span>{f.label}</span>

        {badge(f) && (

         <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
          {badge(f)}
         </span>

        )}

       </div>

       <span className="text-gray-400 text-sm">
        {f.size || ""}
       </span>

      </div>

     ))}

    </div>

   )}

  </div>

 )
}