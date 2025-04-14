import React from 'react';

interface CircularProgressProps {
  size?: number;
  progress?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
  className?: string;
}

const CircularProgress = ({
  size = 32,
  progress = 0,
  strokeWidth = 8,
  trackColor = 'stroke-gray-200',
  progressColor = 'stroke-blue-500',
  children,
  className = '',
}: CircularProgressProps) => {
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 100) / 100);

  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
          className={`fill-transparent ${trackColor}`}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
          className={`fill-transparent ${progressColor}`}
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${offset}`}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center content */}
      {children || (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default CircularProgress;