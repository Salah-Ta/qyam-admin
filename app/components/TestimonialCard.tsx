import React from 'react';

interface TestimonialCardProps {
  name: string;
  comment: string;
  rating?: number;
  createdAt?: string;
  title?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  name, 
  comment, 
  rating = 5,
  createdAt,
  title = "متدربة"
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 min-w-[280px] max-w-[320px] mx-2 my-2 transition-all duration-300">
      <div className="flex flex-col gap-6">
        {/* Comment/Testimonial Text */}
        <div className="text-center">
          <p 
            className="text-gray-800 text-base leading-relaxed [direction:rtl] font-normal"
            style={{
              lineHeight: '1.8'
            }}
          >
            "{comment}"
          </p>
        </div>
        
        {/* Name, Title and Checkmark */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h4 className="font-bold text-[#181d27] text-lg [direction:rtl]">
              {name}
            </h4>
            {/* Blue checkmark */}
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg 
                className="w-3 h-3 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-500 text-sm [direction:rtl]">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
