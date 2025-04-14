import React from "react"

type Props = {
    bgColor:string ,
    className:string
}
const GradientEllipse = (props:Props)=>{


    return <div className={`absolute md:w-[762px] md:h-[384px] w-[320px] h-[192px] rounded-full ${props.bgColor} ${props.className}`}>

    </div>
}

export default GradientEllipse