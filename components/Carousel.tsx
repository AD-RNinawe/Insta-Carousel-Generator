import React, { useState, useRef, createRef, RefObject } from 'react';
import { SlideContent } from '../types';
import Slide from './Slide';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface CarouselProps {
  slides: SlideContent[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZipping, setIsZipping] = useState(false);
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
    const html2canvas = (window as any).html2canvas;

    if (slideElement && html2canvas) {
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
    } else if (!html2canvas) {
        console.error('Error: html2canvas library not found.');
        alert('Could not download image. Required library is not available.');
    }
  };

  const downloadAllSlides = async () => {
    const JSZip = (window as any).JSZip;
    const html2canvas = (window as any).html2canvas;

    if (!JSZip) {
      console.error("JSZip library not found.");
      alert("Could not download all slides. Required library is missing.");
      return;
    }
     if (!html2canvas) {
        console.error('Error: html2canvas library not found.');
        alert('Could not download all slides. Required library is not available.');
        return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();

      for (let i = 0; i < slides.length; i++) {
        const slideElement = slideRefs.current[i].current;
        if (slideElement) {
          const canvas = await html2canvas(slideElement, {
            scale: 2,
            backgroundColor: null,
            useCORS: true,
          });
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          if (blob) {
            zip.file(`slide-${i + 1}.png`, blob);
          }
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'carousel-slides.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (error) {
      console.error("Error creating zip file:", error);
      alert("Failed to create zip file. See console for details.");
    } finally {
      setIsZipping(false);
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

      <div className="w-full flex flex-col space-y-2">
        <button
          onClick={downloadSlide}
          className="w-full flex justify-center items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors"
        >
          <DownloadIcon className="w-5 h-5" />
          Download Slide {currentIndex + 1}
        </button>
        <button
            onClick={downloadAllSlides}
            disabled={isZipping}
            className="w-full flex justify-center items-center gap-2 rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
            {isZipping ? (
                 <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Zipping...</span>
                  </>
            ) : (
                <>
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download All Slides</span>
                </>
            )}
        </button>
      </div>
    </div>
  );
}