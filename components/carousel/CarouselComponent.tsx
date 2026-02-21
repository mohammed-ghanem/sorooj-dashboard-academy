"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type CarouselComponentProps = {
  items: React.ReactNode[];
  className?: string;
  maxWidth?: string;
  height?: string;
  autoplay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  itemsPerView?: number;
  useCardWrapper?: boolean;
  cardClassName?: string;
  cardContentClassName?: string;
};

const CarouselComponent = ({
  items,
  className = "",
  maxWidth = "w-full",
  height = "h-auto",
  autoplay = true,
  interval = 3000,
  showArrows = false,
  showDots = true,
  itemsPerView = 1,
  useCardWrapper = true,
  cardClassName = "w-full border-0 shadow-none py-2 rounded-none",
  cardContentClassName = "flex items-center justify-center p-0",
}: CarouselComponentProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [activeIndex, setActiveIndex] = useState(itemsPerView); // start from first real item
  const [isTransitioning, setIsTransitioning] = useState(true);

  

  // Duplicate items for infinite loop: [cloneLast..original..cloneFirst]
  const extendedItems = [
    ...items.slice(-itemsPerView),
    ...items,
    ...items.slice(0, itemsPerView),
  ];

  const totalItems = extendedItems.length;
  const itemWidth = `${100 / itemsPerView}%`;

  const goToSlide = useCallback(
    (index: number) => {
      setIsTransitioning(true);
      setActiveIndex(index);
    },
    []
  );

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setActiveIndex((prev) => prev + 1);
  }, []);

  const goToPrev = useCallback(() => {
    setIsTransitioning(true);
    setActiveIndex((prev) => prev - 1);
  }, []);

  useEffect(() => {
    if (!autoplay) return;

    const startAutoplay = () => {
      intervalRef.current = setInterval(goToNext, interval);
    };

    const stopAutoplay = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    startAutoplay();
    return stopAutoplay;
  }, [autoplay, interval, goToNext]);

  // Handle seamless reset after reaching clones
  useEffect(() => {
    if (activeIndex === 0) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(items.length);
      }, 500);
      return () => clearTimeout(timeout);
    }
    if (activeIndex === totalItems - itemsPerView) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(itemsPerView);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [activeIndex, items.length, itemsPerView, totalItems]);

  const translateX = `-${activeIndex * (100 / itemsPerView)}%`;

  return (
    <div className={`relative overflow-hidden ${maxWidth} ${className}`} dir="ltr">
      <Carousel className="w-full">
        <CarouselContent
          style={{
            display: "flex",
            transition: isTransitioning ? "transform 0.5s ease" : "none",
            transform: `translateX(${translateX})`,
          }}
        >
          {extendedItems.map((item, index) => (
            <CarouselItem
              key={index}
              style={{ flex: `0 0 ${itemWidth}` }}
            >
              <div className="p-1">
                {useCardWrapper ? (
                  <Card className={cardClassName}>
                    <CardContent
                      className={`${cardContentClassName} ${height}`}
                    >
                      {item}
                    </CardContent>
                  </Card>
                ) : (
                  <div className={`${cardContentClassName} ${height}`}>
                    {item}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {showArrows && (
          <>
            <CarouselPrevious
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
            />
            <CarouselNext
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
            />
          </>
        )}
      </Carousel>

      {showDots && (
        <div className="flex justify-center items-center mt-5 gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index + itemsPerView)}
              className={`h-2 w-2 rounded-full transition-all cursor-pointer ${
                index === (activeIndex - itemsPerView + items.length) % items.length
                  ? "bkMainColor h-3 w-3 transition-all duration-300 ease-in-out "
                  : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarouselComponent;