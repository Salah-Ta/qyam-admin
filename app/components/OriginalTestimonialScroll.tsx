import React, { useEffect, useRef, useState } from 'react';
import TestimonialCard from './TestimonialCard';

interface OriginalTestimonialScrollProps {
  testimonials: Array<{
    id: string;
    name: string;
    comment: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

const OriginalTestimonialScroll: React.FC<OriginalTestimonialScrollProps> = ({ testimonials }) => {
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
    },
    {
      id: '7',
      name: 'رقية محمود',
      comment: 'أفضل برنامج تدريبي شاركت فيه، المحتوى ممتاز والتنظيم رائع',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '8',
      name: 'أسماء حسن',
      comment: 'شكراً جزيلاً لكم على الجهود المبذولة والبرنامج المميز',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '9',
      name: 'زينب أحمد',
      comment: 'برنامج رائع ومفيد، استفدت منه كثيراً في تطوير مهاراتي',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : sampleTestimonials;
  
  // Create three columns for better distribution
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

    let animationIds: number[] = [];
    let scrollPositions = [0, 0, 0];
    const scrollSpeeds = [0.3, 0.4, 0.2]; // Different speeds for each column

    const animate = () => {
      if (!isAnimating) return;
      
      scrollContainers.forEach((container, index) => {
        if (!container) return;
        
        scrollPositions[index] += scrollSpeeds[index];
        
        // Reset position when we've scrolled through half the content
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        
        if (scrollPositions[index] >= maxScroll / 2) {
          scrollPositions[index] = 0;
        }
        
        container.scrollTop = scrollPositions[index];
      });
      
      animationIds[0] = requestAnimationFrame(animate);
    };

    // Start animation after a delay
    const timeoutId = setTimeout(() => {
      animationIds[0] = requestAnimationFrame(animate);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      animationIds.forEach(id => cancelAnimationFrame(id));
    };
  }, [isAnimating]);

  const handleMouseEnter = () => {
    setIsAnimating(false);
  };

  const handleMouseLeave = () => {
    setIsAnimating(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div 
        ref={scrollRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {infiniteColumns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            data-column={columnIndex}
            className="overflow-hidden space-y-6"
            style={{ height: '600px' }}
          >
            {column.map((testimonial, index) => (
              <div key={`${testimonial.id}-${index}-${columnIndex}`} className="flex-shrink-0">
                <TestimonialCard
                  name={testimonial.name}
                  comment={testimonial.comment}
                  rating={testimonial.rating}
                  createdAt={testimonial.createdAt}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OriginalTestimonialScroll;
