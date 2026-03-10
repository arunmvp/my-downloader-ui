"use client"

import {useState} from "react"
import axios from "axios"
import ProgressBar from "./ProgressBar"
import PlatformIcon from "./PlatformIcon"
import FormatDropdown from "./FormatDropdown"
import {Format} from "../types/Format"

export default function Downloader(){

 const [url,setUrl] = useState("")
 const [error,setError] = useState("")
 const [loading,setLoading] = useState(false)
 const [downloading,setDownloading] = useState(false)
 const [thumbnail,setThumbnail] = useState("")
 const [title,setTitle] = useState("")
 const [duration,setDuration] = useState("")
 const [formats,setFormats] = useState<Format[]>([])
 const [format,setFormat] = useState("")
 const [progress,setProgress] = useState(0)
 const [download,setDownload] = useState("")
 const [generated,setGenerated] = useState(false)

 function resetAll(){

  setThumbnail("")
  setTitle("")
  setDuration("")
  setFormats([])
  setFormat("")
  setDownload("")
  setGenerated(false)
  setProgress(0)

 }

 function clearInput(){

  setUrl("")
  resetAll()
  setError("")

 }

 async function pasteURL(){

  try{

   const text = await navigator.clipboard.readText()
   setUrl(text)

  }catch{

   setError("Clipboard permission denied")

  }

 }

 async function generateInfo(){

  setError("")

  if(!url.trim()){
   setError("Paste a valid video URL")
   return
  }

  if(generated){
   setError("Video already generated")
   return
  }

  setLoading(true)

  try{

   const res = await axios.post("http://localhost:5000/api/info",{url})
   const jobId = res.data.jobId

   let attempts = 0

   const interval = setInterval(async()=>{

    attempts++

    try{

     const {data} = await axios.get(`http://localhost:5000/api/status/${jobId}`)

     if(data.status==="completed" || data.state==="completed"){

      const video = data.result

      setThumbnail(video.thumbnail)
      setTitle(video.title)
      setDuration(formatDuration(video.duration))

      const map:any={}

      video.formats.forEach((f:any)=>{

       if(f.ext==="mp4" && f.height){

        if(!map[f.height]){

         map[f.height]={

          label:`${f.height}p MP4`,
          formatId:f.format_id,
          height:f.height,
          size:formatSize(f.filesize),
          type:"video"

         }

        }

       }

      })

      const mp4Formats:Object[]=Object.values(map)
      mp4Formats.sort((a:any,b:any)=>b.height-a.height)

      const mp3:Format={

       label:"MP3 Audio",
       formatId:"mp3",
       size:formatSize(video.filesize_approx),
       type:"audio"

      }

      const finalFormats=[...mp4Formats,mp3] as Format[]

      setFormats(finalFormats)

      const preferred=
       finalFormats.find(f=>f.height===720) ||
       finalFormats.find(f=>f.height===480) ||
       finalFormats.find(f=>f.height===360)

      if(preferred){
       setFormat(preferred.formatId)
      }

      setGenerated(true)
      setLoading(false)

      clearInterval(interval)

     }

     if(attempts>60){

      clearInterval(interval)
      setLoading(false)
      setError("Timeout. Try again.")

     }

    }catch{

     clearInterval(interval)
     setLoading(false)
     setError("Failed to fetch video info")

    }

   },1000)

  }catch{

   setLoading(false)
   setError("Server error")

  }

 }

 async function startDownload(){

  setError("")   // ERROR RESET FIX

  if(!format){
   setError("Select format")
   return
  }

  setDownloading(true)
  setProgress(0)

  try{

   const res = await axios.post("http://localhost:5000/api/download",{url,format})
   const jobId = res.data.jobId

   let attempts = 0

   const interval=setInterval(async()=>{

    attempts++

    try{

     const {data}=await axios.get(`http://localhost:5000/api/status/${jobId}`)

     setProgress(data.progress || 0)

     if(data.status==="completed" || data.state==="completed"){

      setDownload(data.result.downloadUrl)

      setDownloading(false)
      clearInterval(interval)

     }

     if(data.status==="failed" || data.state==="failed"){

      setError("Download failed")
      setDownloading(false)
      clearInterval(interval)

     }

     if(attempts>120){

      setError("Download timeout")
      setDownloading(false)
      clearInterval(interval)

     }

    }catch{

     setError("Download error")
     setDownloading(false)
     clearInterval(interval)

    }

   },1000)

  }catch{

   setError("Server error")
   setDownloading(false)

  }

 }

 function formatDuration(sec:number){

  if(!sec) return ""

  const m=Math.floor(sec/60)
  const s=sec%60

  return `${m}:${s<10?"0":""}${s}`

 }

 function formatSize(bytes:number){

  if(!bytes) return ""

  return (bytes/1024/1024).toFixed(1)+" MB"

 }

 return(

 <div className="w-full flex justify-center mt-10 px-4">

  <div className="bg-white shadow-xl rounded-[30px] p-6 w-full max-w-5xl">

   <div className="flex items-center gap-2 mb-2">
    <PlatformIcon url={url}/>
   </div>

   <div className="flex flex-col md:flex-row gap-3">

    <div className="relative flex-1">

     <input
      value={url}
      onChange={(e)=>setUrl(e.target.value)}
      onKeyDown={(e)=>{

       if(e.key==="Enter"){
        generateInfo()
       }

      }}
      placeholder="Paste video URL"
      className="w-full border p-3 rounded-[30px] outline-none focus:ring-2 focus:ring-blue-400 pr-10"
     />

     {url &&(

      <button
       onClick={clearInput}
       className="absolute right-3 top-3 text-gray-400 cursor-pointer"
      >
       ✕
      </button>

     )}

    </div>

    <button
     onClick={pasteURL}
     className="bg-gray-200 px-6 py-3 rounded-[30px] cursor-pointer"
    >
     Paste
    </button>

    <button
     onClick={generateInfo}
     className="bg-blue-500 text-white px-6 py-3 rounded-[30px] cursor-pointer flex items-center justify-center gap-2"
    >

     {loading ?(
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
     ):"Generate"}

    </button>

   </div>

   {error &&(
    <p className="text-red-500 mt-3">{error}</p>
   )}

   {thumbnail &&(

    <div className="grid md:grid-cols-2 gap-6 mt-6 items-center">

     <div>

      <img
       src={thumbnail}
       className="rounded-[30px]"
      />

      <p className="text-gray-500 text-sm mt-2">
       Duration: {duration}
      </p>

     </div>

     <div>

      <h3 className="font-semibold text-lg">
       {title}
      </h3>

      <p className="text-gray-500 text-sm mt-4">
       Change Format
      </p>

      <FormatDropdown
       formats={formats}
       value={format}
       onChange={setFormat}
      />

      <button
       onClick={startDownload}
       className="w-full mt-4 bg-green-500 text-white p-3 rounded-[30px] cursor-pointer flex items-center justify-center gap-2"
      >

       {downloading?(
        <>
         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
         Preparing
        </>
       ):"Download"}

      </button>

     </div>

    </div>

   )}

   {progress>0 &&(

    <div className="mt-6">

     <ProgressBar progress={progress}/>

     <p className="text-center mt-2 text-gray-500">
      Downloading {progress}%
     </p>

    </div>

   )}

   {download &&(

    <a
     href={`http://localhost:5000${download}`}
     className="block text-center mt-6 bg-purple-500 text-white p-3 rounded-[30px]"
    >
     Download File
    </a>

   )}

  </div>

 </div>

 )
}