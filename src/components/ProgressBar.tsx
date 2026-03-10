export default function ProgressBar({progress}:{progress:number}){

 return(

  <div className="w-full bg-gray-200 rounded-[30px] h-3 overflow-hidden">

   <div
    className="bg-linear-to-r from-blue-500 to-purple-500 h-3 transition-all duration-500"
    style={{width:`${progress}%`}}
   />

  </div>

 )

}