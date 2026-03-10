export default function PlatformIcon({url}:{url:string}){

 if(url.includes("youtube"))
  return <span className="text-red-500 font-semibold">YouTube</span>

 if(url.includes("instagram"))
  return <span className="text-pink-500 font-semibold">Instagram</span>

 if(url.includes("tiktok"))
  return <span className="text-black font-semibold">TikTok</span>

 if(url.includes("twitter") || url.includes("x.com"))
  return <span className="text-blue-500 font-semibold">Twitter</span>

 if(url.includes("facebook") || url.includes("fb.watch"))
  return <span className="text-blue-600 font-semibold">Facebook</span>

 return null
}