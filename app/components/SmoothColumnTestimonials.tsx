import React from 'react';
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
  // Sample testimonial data if none exist
  const sampleTestimonials = [
    {
      id: '1',
      name: 'حنان الحربي',
      comment: 'تعلمت من خلال العمل التطوعي كيف أشتغل ضمن فريق، وأقدر أنظم وقتي بين الدراسة والنشاط التطوعي بدون ضغط',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'فاطمة أحمد',
      comment: 'كانت تجربة رائعة ومفيدة جداً، تعلمت مهارات جديدة وطورت قدراتي بشكل كبير',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'نورا محمد',
      comment: 'البرنامج ممتاز والمدربات محترفات، أنصح كل فتاة بالمشاركة في هذا البرنامج',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'سارة علي',
      comment: 'تجربة مميزة ساعدتني في اكتشاف مواهبي وتطوير مهاراتي المهنية',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'مريم خالد',
      comment: 'شكراً لكم على هذا البرنامج الرائع، استفدت كثيراً وحققت أهدافي',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'عائشة سالم',
      comment: 'برنامج متميز بكل ما تحمله الكلمة من معنى، ننتظر المزيد من البرامج المفيدة',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const displayTestimonials = testimonials?.length > 0 ? [...sampleTestimonials, ...testimonials] : sampleTestimonials;

  // Create three columns for distribution
  const createColumns = () => {
    const columns: typeof displayTestimonials[] = [[], [], []];
    displayTestimonials.forEach((testimonial, index) => {
      columns[index % 3].push(testimonial);
    });
    return columns;
  };

  const columns = createColumns();

  return (
    <>
      <style>{`
        @keyframes scrollUp0 {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown1 {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        @keyframes scrollUp2 {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .scroll-animation-0 {
          animation: scrollUp0 30s linear infinite;
        }
        .scroll-animation-1 {
          animation: scrollDown1 40s linear infinite;
        }
        .scroll-animation-2 {
          animation: scrollUp2 35s linear infinite;
        }
        .scroll-animation-0:hover,
        .scroll-animation-1:hover,
        .scroll-animation-2:hover {
          animation-play-state: paused;
        }
        .testimonial-column {
          position: relative;
        }
        .testimonial-column::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(to bottom, rgb(249 249 249), rgba(255, 255, 255, 0));
          z-index: 10;
          pointer-events: none;
        }
        .testimonial-column::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(to top, rgb(249 249 249), rgba(255, 255, 255, 0));
          z-index: 10;
          pointer-events: none;
        }
      `}</style>
      <div className="flex flex-col max-w-screen-xl items-start gap-8 px-8 w-full mb-10 pb-10">
      <div className="flex flex-col items-right gap-10 w-full">
        <div className="flex flex-col md:flex-row md:flex-nowrap items-start gap-8 w-full">
          {columns.map((column, columnIndex) => (
            <div 
              key={columnIndex} 
              className="flex justify-center flex-1 overflow-hidden testimonial-column"
              style={{ height: '600px' }}
            >
              <div className={`space-y-6 scroll-animation-${columnIndex}`}>
                {/* Duplicate content for seamless infinite scroll */}
                {[...column, ...column].map((testimonial, index) => (
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
    </>
  );
};

export default OriginalColumnTestimonials;
