import React, { useEffect, useRef } from 'react';
import TestimonialCard from './TestimonialCard';

interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
  createdAt: string;
}

interface InfiniteTestimonialsProps {
  testimonials: Testimonial[];
}

const InfiniteTestimonials: React.FC<InfiniteTestimonialsProps> = ({ testimonials }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // If no testimonials, use sample data
  const sampleTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'فاطمة أحمد',
      comment: 'كانت تجربة رائعة ومفيدة جداً، تعلمت مهارات جديدة وطورت قدراتي بشكل كبير',
      rating: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'نورا محمد',
      comment: 'البرنامج ممتاز والمدربات محترفات، أنصح كل فتاة بالمشاركة في هذا البرنامج',
      rating: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'سارة علي',
      comment: 'تجربة مميزة ساعدتني في اكتشاف مواهبي وتطوير مهاراتي المهنية',
      rating: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'مريم خالد',
      comment: 'شكراً لكم على هذا البرنامج الرائع، استفدت كثيراً وحققت أهدافي',
      rating: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'عائشة سالم',
      comment: 'برنامج متميز بكل ما تحمله الكلمة من معنى، ننتظر المزيد من البرامج المفيدة',
      rating: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'هند عبدالله',
      comment: 'تجربة لا تُنسى، تعلمت الكثير وكونت صداقات جميلة مع المتدربات',
      rating: 5,
      createdAt: new Date().toISOString()
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

    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.3; // Slower speed for better readability

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      // Reset position when we've scrolled through one set of testimonials
      if (scrollPosition >= maxScroll / 3) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    // Start animation after a small delay
    const startAnimation = () => {
      animationId = requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(startAnimation, 1000);

    // Pause animation on hover
    const handleMouseEnter = () => {
      cancelAnimationFrame(animationId);
    };

    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    // Pause animation on touch (mobile)
    const handleTouchStart = () => {
      cancelAnimationFrame(animationId);
    };

    const handleTouchEnd = () => {
      setTimeout(() => {
        animationId = requestAnimationFrame(animate);
      }, 2000); // Resume after 2 seconds on mobile
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    scrollContainer.addEventListener('touchstart', handleTouchStart);
    scrollContainer.addEventListener('touchend', handleTouchEnd);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [displayTestimonials.length]);

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-transparent via-gray-50 to-transparent py-4">
      <div
        ref={scrollRef}
        className="flex gap-6 px-4"
        style={{
          width: '100%',
          scrollBehavior: 'auto'
        }}
      >
        {infiniteTestimonials.map((testimonial, index) => (
          <TestimonialCard
            key={`${testimonial.id}-${index}`}
            name={testimonial.name}
            comment={testimonial.comment}
            rating={testimonial.rating}
            createdAt={testimonial.createdAt}
          />
        ))}
      </div>
    </div>
  );
};

export default InfiniteTestimonials;
