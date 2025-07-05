import React from 'react';

interface TestimonialCardProps {
  name: string;
  comment: string;
  rating?: number;
  createdAt?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  name, 
  comment, 
  rating = 5,
  createdAt 
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 min-w-[280px] max-w-[320px] mx-2 my-2 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-[#17b169]/20">
      <div className="flex flex-col gap-4">
        {/* Rating */}
        <div className="flex justify-center gap-1">
          {renderStars(rating)}
        </div>
        
        {/* Comment */}
        <div className="text-center">
          <p 
            className="text-gray-700 text-sm sm:text-base leading-relaxed [direction:rtl] font-medium"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            "{comment}"
          </p>
        </div>
        
        {/* Name and Date */}
        <div className="text-center border-t pt-4">
          <h4 className="font-bold text-[#181d27] text-base sm:text-lg [direction:rtl]">
            {name}
          </h4>
          {createdAt && (
            <p className="text-gray-500 text-xs sm:text-sm mt-1 [direction:rtl]">
              {formatDate(createdAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
