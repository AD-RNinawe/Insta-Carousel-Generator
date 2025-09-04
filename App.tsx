
import React, { useState, useCallback, useRef } from 'react';
import { SlideContent } from './types';
import { chunkProseForCarousel } from './services/geminiService';
import Carousel from './components/Carousel';
import { PhotoIcon, SparklesIcon } from './components/icons/EditorIcons';

export default function App() {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [prose, setProse] = useState<string>('');
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCarousel = useCallback(async () => {
    if (!coverImage || !title || !prose) {
      setError('Please provide a cover image, title, and prose.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setSlides([]);

    try {
      const proseChunks = await chunkProseForCarousel(prose);
      const coverSlide: SlideContent = { type: 'cover', imageUrl: imageUrl!, title };
      const proseSlides: SlideContent[] = proseChunks.map(chunk => ({ type: 'prose', text: chunk }));
      setSlides([coverSlide, ...proseSlides]);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      console.error(e);
      setError('Failed to generate carousel slides. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [coverImage, title, prose, imageUrl]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text pb-2">
            AI Instagram Carousel Generator
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Turn your stories into stunning, shareable carousels. Provide a cover, title, and text, and let AI handle the formatting.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700">
            <h2 className="text-2xl font-semibold mb-6 text-white">1. Add Your Content</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cover Photo</label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-600 px-6 py-10 hover:border-indigo-400 transition-colors">
                  <div className="text-center">
                    {imageUrl ? (
                       <img src={imageUrl} alt="Cover preview" className="mx-auto h-32 w-32 object-cover rounded-md" />
                    ) : (
                      <PhotoIcon className="mx-auto h-12 w-12 text-slate-500" />
                    )}
                    <div className="mt-4 flex text-sm leading-6 text-slate-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 hover:text-indigo-300"
                      >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-300">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Your Awesome Title"
                  className="mt-2 block w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="prose" className="block text-sm font-medium text-slate-300">Prose</label>
                <textarea
                  id="prose"
                  rows={8}
                  value={prose}
                  onChange={(e) => setProse(e.target.value)}
                  placeholder="Paste your full text here. Our AI will split it into perfectly sized slides..."
                  className="mt-2 block w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <button
                onClick={handleGenerateCarousel}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Generate Carousel
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="flex flex-col">
             <h2 className="text-2xl font-semibold mb-6 text-white">2. Preview & Download</h2>
             <div ref={resultsRef} className="flex-grow flex items-center justify-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700 min-h-[400px] lg:min-h-0">
                {error && <p className="text-red-400 text-center">{error}</p>}
                {!error && isLoading && <p className="text-slate-400 text-center">AI is crafting your slides...</p>}
                {!isLoading && slides.length > 0 && <Carousel slides={slides} />}
                {!isLoading && !error && slides.length === 0 && (
                   <div className="text-center text-slate-500">
                     <p>Your generated carousel will appear here.</p>
                   </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
