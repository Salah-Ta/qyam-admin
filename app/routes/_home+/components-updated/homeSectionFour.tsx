import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import maskgroup from "../../../assets/images/new-design/group-1.svg";
// import backgroundmasksection4 from "../../../assets/images/new-design/backgroundmasksection4.png";
import leftsection4 from "../../../assets/images/new-design/left-section-4.svg";
import rightsection4 from "../../../assets/images/new-design/photo-section-4.svg";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio: number;
}

function AspectRatio({
  ratio,
  className,
  children,
  ...props
}: AspectRatioProps) {
  return (
    <div className={cn("relative w-full", className)} {...props}>
      <div style={{ paddingBottom: `${100 / ratio}%` }} />
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground",
        className
      )}
      {...props}
    />
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export const HomeSectionFour = (): JSX.Element => {
  return (
    // <Card className="w-full h-screen border-0 "
    // style={{
    //   backgroundImage: `url(${backgroundmasksection4})`,
    //   backgroundSize: "contain",

    //   backgroundPosition: "right",
    //   backgroundRepeat: "no-repeat",
    // }}
    // >
    //   <CardContent className="relative w-full h-full m-auto p-0">
    //     <div className="relative h-full">
    //       {/* Green radial gradient */}
    //       <div
    //         className="absolute w-[691px] h-[374px] top-[159px] "
    //         aria-hidden="true"
    //       />

    //       {/* Main image */}
    //       <AspectRatio ratio={1438 / 632} className="mt-[30px]">
    //         <img
    //           className="w-full h-full object-cover"
    //           alt="Promotional banner"

    //           src={maskgroup}
    //         />
    //       </AspectRatio>
    //     </div>
    //   </CardContent>
    // </Card>
<div className="w-full h-screen flex flex-col lg:flex-row relative [background:radial-gradient(50%_50%_at_100%_50%,rgba(104,195,92,1)_0%,rgba(104,195,92,0)_96%)] ">
  {/* Left Image - Desktop Only */}
  <div className="hidden lg:block w-[20%] h-full">
    <img
      src={leftsection4}
      alt="Left decoration"
      className="w-full h-full object-contain object-left"
    />
  </div>

  {/* Content Area */}
  <div className="flex flex-col items-end lg:flex-row flex-1">
    {/* Mobile Image - Larger height */}
    <div className="lg:hidden w-full h-[60vh]"> {/* Increased from 40vh to 60vh */}
      <img
        src={rightsection4}
        alt="Mobile decoration"
        className="w-full h-full object-cover"
      />
    </div>

    {/* Text Section - Reduced height on mobile */}
    <div className="flex-1 flex text-center items-center justify-center p-4 lg:p-0 h-[40vh] lg:h-auto  lg:mb-52"> {/* Added h-[40vh] for mobile */}
        {/* <div className="absolute   text-red-600 opacity-70 group-hover:opacity-100">♥</div> */}
      <p className="text-[#006173] text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-center lg:text-right">
      .. سـاعاتٌ من العطاء"
        <br />
      "  عمـــرٌ مــــن التمــيّز
      </p>
    </div>
    {/* Right Image - Desktop Only */}
    <div className="hidden lg:block w-[50%] h-full mr-[112px]">
  
      <img
        src={rightsection4}
        alt="Right decoration"
        className="w-full h-full object-contain object-right"
      />
  

    </div>
  </div>
</div>
  );
};
