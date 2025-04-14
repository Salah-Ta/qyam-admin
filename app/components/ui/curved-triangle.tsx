import { ReactNode } from 'react';

interface IProps {
    color:string,
    className?:string, 
    children?:ReactNode
}
const CurvedTriangle = ({ color = 'red', className = '', children}:IProps) => {
  return (
    <div className={`w-48 relatve ${className}`} style={{ aspectRatio: '2/1' }}>
        {children}

      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
      >
        <path d={`
            M 20,10
            L 180,10
            Q 190,10 190,20
            L 105,85
            Q 100,90 95,85
            L 10,20
            Q 10,10 20,10
            Z
          `}
          fill={color}
        />
      </svg>
    </div>
  );
};

export default CurvedTriangle;