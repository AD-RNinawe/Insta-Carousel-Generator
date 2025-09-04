
import React, { useState, useRef, createRef, RefObject } from 'react';
import { SlideContent } from '../types';
import Slide from './Slide';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface CarouselProps {
  slides: SlideContent[];
}

// html2canvas is loaded from a CDN in index.html
declare const html2canvas: any;

export default function Carousel({ slides }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideRefs = useRef<RefObject<HTMLDivElement>[]>(
    slides.map(() => createRef<HTMLDivElement>())
  );

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const downloadSlide = async () => {
    const slideElement = slideRefs.current[currentIndex].current;
    if (slideElement) {
       try {
        const canvas = await html2canvas(slideElement, {
            scale: 2, // Higher scale for better resolution
            backgroundColor: null,
            useCORS: true,
        });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = `carousel-slide-${currentIndex + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
       } catch (error) {
           console.error('Error generating image:', error);
           alert('Could not download image. See console for details.');
       }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <div className="relative w-full aspect-[4/5] mb-4">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0'
            }`}
          >
            <Slide ref={slideRefs.current[index]} slide={slide} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between w-full mb-4">
        <button onClick={goToPrevious} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-slate-400">
          {currentIndex + 1} / {slides.length}
        </span>
        <button onClick={goToNext} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50">
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={downloadSlide}
        className="w-full flex justify-center items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors"
      >
        <DownloadIcon className="w-5 h-5" />
        Download Slide {currentIndex + 1}
      </button>
    </div>
  );
}
