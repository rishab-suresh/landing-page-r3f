import { forwardRef } from 'react';
import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  subtitle: string;
  description?: string;
  children?: ReactNode;
  align?: 'left' | 'center' | 'right';
  id?: string;
  nextId?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(({ title, subtitle, description, children, align = 'center', id, nextId }, ref) => {
  return (
    <section id={id} ref={ref} className={`min-h-screen flex flex-col justify-center ${align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center'} px-8 py-20 relative`}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent pointer-events-none" />
      
      <div className={`relative z-10 max-w-4xl ${align === 'center' ? 'mx-auto' : ''}`}>
        <h2 
          data-aos="fade-up" 
          className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-yellow-600 bg-clip-text text-transparent leading-tight"
        >
          {title}
        </h2>
        
        <p 
          data-aos="fade-up" 
          data-aos-delay="200" 
          className="text-xl md:text-3xl font-light mb-8 text-gray-300 leading-relaxed"
        >
          {subtitle}
        </p>
        
        {description && (
          <p 
            data-aos="fade-up" 
            data-aos-delay="400" 
            className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-light"
          >
            {description}
          </p>
        )}
        
        {children && (
          <div data-aos="fade-up" data-aos-delay="600">
            {children}
          </div>
        )}

        {nextId && (
          <div 
            data-aos="fade-up" 
            data-aos-delay="700" 
            className={`mt-10 flex ${align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'}`}
          >
            <button
              onClick={() => {
                const el = document.getElementById(nextId);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Scroll to next section"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M12 19l-6-6M12 19l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

    </section>
  );
});
