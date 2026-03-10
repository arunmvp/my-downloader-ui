import Navbar from "@/components/Navbar"
import Downloader from "@/components/Downloader"

export default function Home(){

 return(

  <main className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">

   <Navbar/>

   <section className="max-w-6xl mx-auto px-6 text-center mt-20">

    <h1 className="text-5xl font-bold">
     Download Videos Instantly
    </h1>

    <p className="text-gray-500 mt-3">
     Download videos from YouTube, Instagram, TikTok in MP4 or MP3
    </p>

    <Downloader/>

   </section>

  </main>

 )
}