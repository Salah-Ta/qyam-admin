import React, { useEffect, useRef } from 'react';

interface VerticalInfiniteScrollProps {
  testimonials: Array<{
    id: string;
    name: string;
    comment: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

const VerticalInfiniteScroll: React.FC<VerticalInfiniteScrollProps> = ({ testimonials }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sample testimonial data if none exist
  const sampleTestimonials = [
    {
      id: '1',
      name: 'فاطمة أحمد',
      comment: 'كانت تجربة رائعة ومفيدة جداً، تعلمت مهارات جديدة وطورت قدراتي بشكل كبير',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'نورا محمد',
      comment: 'البرنامج ممتاز والمدربات محترفات، أنصح كل فتاة بالمشاركة في هذا البرنامج',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'سارة علي',
      comment: 'تجربة مميزة ساعدتني في اكتشاف مواهبي وتطوير مهاراتي المهنية',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'مريم خالد',
      comment: 'شكراً لكم على هذا البرنامج الرائع، استفدت كثيراً وحققت أهدافي',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'عائشة سالم',
      comment: 'برنامج متميز بكل ما تحمله الكلمة من معنى، ننتظر المزيد من البرامج المفيدة',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'هند عبدالله',
      comment: 'تجربة لا تُنسى، تعلمت الكثير وكونت صداقات جميلة مع المتدربات',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : sampleTestimonials;
  
  // Duplicate testimonials for seamless infinite scroll
  const infiniteTestimonials = [
    ...displayTestimonials,
    ...displayTestimonials,
    ...displayTestimonials
  ];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = scrollContainer.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      // Reset position when we've scrolled through one set of testimonials
      if (scrollPosition >= maxScroll / 3) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollTop = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    // Start animation after a small delay
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 1000);

    // Pause animation on hover
    const handleMouseEnter = () => {
      cancelAnimationFrame(animationId);
    };

    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [displayTestimonials.length]);

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

  return (
    <div className="flex flex-col md:flex-row md:flex-nowrap items-start gap-8 w-full">
      {/* Create 3 columns like the original */}
      {[0, 1, 2].map((columnIndex) => (
        <div key={columnIndex} className="flex-1">
          <div
            ref={columnIndex === 0 ? scrollRef : null}
            className="space-y-6 overflow-hidden"
            style={{ height: '600px' }}
          >
            {infiniteTestimonials
              .filter((_, index) => index % 3 === columnIndex)
              .map((testimonial, index) => (
                <div
                  key={`${testimonial.id}-${index}-${columnIndex}`}
                  className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                >
                  <div className="flex flex-col gap-4">
                    {/* Rating */}
                    <div className="flex justify-center gap-1">
                      {renderStars(testimonial.rating)}
                    </div>
                    
                    {/* Comment */}
                    <div className="text-center">
                      <p className="text-gray-700 text-base leading-relaxed [direction:rtl] font-medium">
                        "{testimonial.comment}"
                      </p>
                    </div>
                    
                    {/* Name */}
                    <div className="text-center border-t pt-4">
                      <h4 className="font-bold text-[#181d27] text-lg [direction:rtl]">
                        {testimonial.name}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerticalInfiniteScroll;
