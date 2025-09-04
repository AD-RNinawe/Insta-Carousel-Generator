
import React, { forwardRef } from 'react';
import { SlideContent } from '../types';

interface SlideProps {
  slide: SlideContent;
}

const Slide = forwardRef<HTMLDivElement, SlideProps>(({ slide }, ref) => {
  if (slide.type === 'cover') {
    return (
      <div ref={ref} className="w-full h-full relative bg-black flex items-center justify-center p-8 text-center overflow-hidden rounded-lg">
        <img src={slide.imageUrl} alt={slide.title} className="absolute top-0 left-0 w-full h-full object-cover opacity-40 blur-sm" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>
        <h2 className="relative text-white text-4xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-lg">
          {slide.title}
        </h2>
      </div>
    );
  }

  return (
    <div ref={ref} className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-8 md:p-10 rounded-lg">
      <p className="text-white text-lg md:text-xl font-medium leading-relaxed text-center">
        {slide.text}
      </p>
    </div>
  );
});

Slide.displayName = 'Slide';
export default Slide;