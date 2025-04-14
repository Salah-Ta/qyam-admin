interface IProps {
  color:string, 
  className:string,
  size?:"sm"|"md"|"lg"|"xl"|"mx"
}

const ColoredDrop = ({color,className,size="lg"}:IProps)=>{
  const calcSize = ()=>{
    switch (size) {
      case "sm":    
      return 1/4
        case "md":
          return 1/2

          case "mx":
            return 3/4
          case "lg":
            return 1
      case "xl":
        return 1.5
      default:
        return(1)

    }

  }
const svgSize:number =  calcSize()

    return <svg 
    preserveAspectRatio="xMidYMid"
    
    className={className} xmlns="http://www.w3.org/2000/svg" width={svgSize*382} height={svgSize*353} viewBox={`0 0 ${svgSize * 382} ${svgSize * 353}`} fill="none">
    <path
    
    transform={`scale(${svgSize})`}
    d="M325.687 240.081L262.683 292.728C225.632 323.663 194.942 346.181 165.649 351.714C148.305 354.986 130.779 352.179 111.675 341.409C104.985 337.649 98.1015 332.9 90.9685 327.072C85.6755 322.777 80.2349 317.869 74.6466 312.359L0 238.797L90.9685 131.016L106.847 112.191L161.344 47.615C200.053 1.52359 246.952 -7.59925 287.274 5.39768C307.537 11.9416 326.278 24.0183 341.623 39.7873C357.002 55.6017 368.928 75.063 375.493 96.3307C389.498 141.65 378.98 195.557 325.687 240.081Z" fill={color}/>
  </svg>
}

export default ColoredDrop