/**
 * Carrousel d'illustrations d'article — porté du pattern Carousel (embla)
 * des 4 articles à slides de la SPA source. Îlot React hydraté à la vue.
 */
import { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface Slide {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export default function BlogSlides({ slides }: { slides: Slide[] }) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(slides.length);

  useEffect(() => {
    if (!carouselApi) return;
    setSlideCount(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on('select', () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  return (
    <div className="relative">
      <Carousel setApi={setCarouselApi} opts={{ loop: true }} className="max-w-xl mx-auto">
        <CarouselContent>
          {slides.map((slide, i) => (
            <CarouselItem key={i}>
              <img
                src={slide.src}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                className="w-full h-auto rounded-2xl shadow-lg object-contain"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {currentSlide + 1} / {slideCount}
      </p>
    </div>
  );
}
