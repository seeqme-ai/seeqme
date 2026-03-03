import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';

interface BuildOnboardingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNeverShowAgain: () => void;
  slideImages?: [string, string, string];
}

type Slide = {
  title: string;
  caption: string;
  image: string;
};

const defaultSlides: [string, string, string] = [
  '/demo1.jpg',
  '/demo2.jpg',
  '/demo3.jpg'
];

const FALLBACK_IMG = '/placeholder.svg';

function normalizeSlideImages(images?: [string, string, string]): [string, string, string] {
  const source = images || defaultSlides;
  return [
    source[0] || defaultSlides[0] || FALLBACK_IMG,
    source[1] || defaultSlides[1] || FALLBACK_IMG,
    source[2] || defaultSlides[2] || FALLBACK_IMG
  ];
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

const BuildOnboardingDrawer: React.FC<BuildOnboardingDrawerProps> = ({
  isOpen,
  onClose,
  onNeverShowAgain,
  slideImages
}) => {
  const [resolvedImages, setResolvedImages] = useState<[string, string, string]>(() => normalizeSlideImages(slideImages));
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setResolvedImages(normalizeSlideImages(slideImages));
  }, [slideImages]);

  useEffect(() => {
    if (!isOpen) return;
    resolvedImages.forEach((src, idx) => {
      if (!src || preloadedRef.current.has(src)) return;
      preloadedRef.current.add(src);
      preloadImage(src).catch(() => {
        setResolvedImages((prev) => {
          const next: [string, string, string] = [...prev] as [string, string, string];
          next[idx] = defaultSlides[idx] || FALLBACK_IMG;
          return next;
        });
      });
    });
  }, [isOpen, resolvedImages]);

  const slides = useMemo<Slide[]>(() => ([
    {
      title: 'Open Section Editor',
      caption: 'Use Edit Sections to start customizing your portfolio content and layout.',
      image: resolvedImages[0] || FALLBACK_IMG
    },
    {
      title: 'Edit Every Section',
      caption: 'In this screen, arrow 1 points to the theme dropdown so you can change the visual style. Arrow 2 points to Edit Sections, where you can update Header, Hero, Skills, Projects, Experience, Contact, and other section content (text, links, images, and files).',
      image: resolvedImages[1] || FALLBACK_IMG
    },
    {
      title: 'Publish Live',
      caption: 'When you are done editing, use Publish to deploy your portfolio to a live URL.',
      image: resolvedImages[2] || FALLBACK_IMG
    }
  ]), [resolvedImages]);

  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;

  const handleContinue = () => {
    if (isLast) {
      setIndex(0);
      onClose();
      return;
    }
    setIndex((prev) => prev + 1);
  };

  const handleClose = () => {
    setIndex(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[9998] bg-black/20"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 230 }}
            className="fixed inset-x-0 bottom-0 z-[9999] bg-white rounded-t-3xl border-t border-slate-200 shadow-[0_-16px_40px_rgba(15,23,42,0.15)]"
          >
            <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-1.5 w-12 rounded-full bg-slate-200" />
                <button
                  onClick={handleClose}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close onboarding"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-[1.15fr_1fr] md:items-center">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:p-3">
                  <img
                    key={`${index}-${slides[index].image}`}
                    src={slides[index].image || '/placeholder.svg'}
                    alt={slides[index].title}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="h-56 w-full object-contain sm:h-72"
                    onError={(e) => {
                      setResolvedImages((prev) => {
                        const next: [string, string, string] = [...prev] as [string, string, string];
                        next[index] = FALLBACK_IMG;
                        return next;
                      });
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Next Steps {index + 1}/3
                  </p>
                  <h3 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    {slides[index].title}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600 sm:text-base">
                    {slides[index].caption}
                  </p>
                  <div className="flex gap-2">
                    {slides.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-slate-900' : 'w-3 bg-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={onNeverShowAgain}
                  className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
                >
                  Never show this again
                </button>
                <button
                  onClick={handleContinue}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-900"
                >
                  {isLast ? 'Done' : 'Continue'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BuildOnboardingDrawer;
