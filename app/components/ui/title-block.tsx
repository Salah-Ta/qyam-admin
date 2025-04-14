import React from "react";

interface TitleBlockProps {
  text: string;
  className?:string,
}

const TitleBlock = ({ text ,className}:TitleBlockProps) => {
  return (
    <div className={`relative w-max h-fit pl-3 ${className}`}>
    <div className="bg-secondary clip-path-angled-clip w-full h-full absolute inset-0">    </div>
    
    <h3 className="relative">
      {text}
    </h3>
  </div>
  );
};

export default TitleBlock;
