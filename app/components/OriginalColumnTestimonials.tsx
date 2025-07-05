import React, { useEffect, useRef, useState } from 'react';
import TestimonialCard from './TestimonialCard';

interface OriginalColumnTestimonialsProps {
  testimonials: Array<{
    id: string;
    name: string;
    comment: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

const OriginalColumnTestimonials: React.FC<OriginalColumnTestimonialsProps> = ({ testimonials }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);

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

  const displayTestimonials = testimonials.length > 0 ? [ ...testimonials] : sampleTestimonials;

  // Create three columns for distribution
  const createColumns = () => {
    const columns: typeof displayTestimonials[] = [[], [], []];
    displayTestimonials.forEach((testimonial, index) => {
      columns[index % 3].push(testimonial);
    });
    return columns;
  };

  const columns = createColumns();
  
  // Duplicate each column for infinite scroll
  const infiniteColumns = columns.map(column => [
    ...column,
    ...column,
    ...column
  ]);

  useEffect(() => {
    const scrollContainers = [
      scrollRef.current?.querySelector('[data-column="0"]') as HTMLDivElement,
      scrollRef.current?.querySelector('[data-column="1"]') as HTMLDivElement,
      scrollRef.current?.querySelector('[data-column="2"]') as HTMLDivElement,
    ];

    if (!scrollContainers.every(container => container)) return;

    let animationId: number;
    let scrollPositions = [0, 0, 0];
    const scrollSpeeds = [0.5, 0.3, 0.4]; // Different speeds for each column

    const animate = () => {
      if (!isAnimating) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      scrollContainers.forEach((container, index) => {
        if (!container) return;
        
        const scrollableContent = container.firstElementChild as HTMLElement;
        if (!scrollableContent) return;
        
        scrollPositions[index] += scrollSpeeds[index];
        
        // Get the height of one set of content (since we have 3 copies)
        const contentHeight = scrollableContent.scrollHeight / 3;
        
        // Reset position smoothly when we've scrolled through one complete set
        if (scrollPositions[index] >= contentHeight) {
          scrollPositions[index] = 0;
        }
        
        // Use transform instead of scrollTop for smoother animation
        scrollableContent.style.transform = `translateY(-${scrollPositions[index]}px)`;
      });
      
      animationId = requestAnimationFrame(animate);
    };

    // Start animation immediately for smoother experience
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isAnimating, displayTestimonials.length]);

  const handleMouseEnter = () => {
    setIsAnimating(false);
  };

  const handleMouseLeave = () => {
    setIsAnimating(true);
  };

  return (
    <div className="flex flex-col max-w-screen-xl items-start gap-8 px-8 w-full mb-5">
      <div className="flex flex-col items-center gap-10 w-full">
        <div 
          ref={scrollRef}
          className="flex flex-col md:flex-row md:flex-nowrap items-start gap-8 w-full"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {infiniteColumns.map((column, columnIndex) => (
            <div 
              key={columnIndex} 
              data-column={columnIndex}
              className="flex-1 overflow-hidden"
              style={{ height: '600px' }}
            >
              <div className="space-y-6">
                {column.map((testimonial, index) => (
                  <TestimonialCard
                    key={`${testimonial.id}-${index}-${columnIndex}`}
                    name={testimonial.name}
                    comment={testimonial.comment}
                    rating={testimonial.rating}
                    createdAt={testimonial.createdAt}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OriginalColumnTestimonials;
