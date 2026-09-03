// HomePageSlider.jsx

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useLocalizedRouter } from "@/utils/localizedNav";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { setFilterCategory } from "@/redux/slices/productFilterSlice";

const HomePageSlider = ({ slider }) => {
  const dispatch = useDispatch();
  const router = useLocalizedRouter();
  const language = useSelector((state) => state.Language.selectedLanguage);

  const slides = slider?.sliders || [];
  const slideCount = slides.length;

  const autoplayPlugin = Autoplay({
    delay: 2000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: slideCount > 1,
      align: "start",
      containScroll: "trimSnaps",
      direction: language?.type === "RTL" ? "rtl" : "ltr",
    },
    [autoplayPlugin],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleSliderClick = (slide) => {
    if (slide?.type === "slider_url") {
      window.open(slide?.slider_url, "_blank");
    } else if (slide?.type === "product") {
      router.push(`/product/${slide.type_slug}`);
    } else if (slide?.type === "category") {
      if (slide?.category_data?.has_child === true) {
        router.push(`/categories/${slide?.type_slug}`);
      } else {
        dispatch(setFilterCategory({ data: slide?.type_id.toString() }));
        router.push(`/products`);
      }
    }
  };

  if (slideCount === 0) {
    return null;
  }

  return (
    <div className="w-full container pt-3 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Carousel Section */}
        <div className="md:col-span-9 relative">
          <div className="overflow-hidden rounded-lg" ref={emblaRef} key={language?.type}>
            <div className="flex ml-[-12px]">
              {slides.map((slide, index) => (
                <div
                  className="relative flex-shrink-0 min-w-0 pl-[12px] basis-full"
                  key={index}
                >
                  <div
                    className="overflow-hidden cursor-pointer"
                    onClick={() => handleSliderClick(slide)}
                  >
                    <Image
                      src={slide.image_url}
                      alt="Slider Image"
                      priority={index === 0}
                      fetchpriority={index === 0 ? "high" : "auto"}
                      className="w-full h-auto object-cover aspect-[1440/543] rounded-lg"
                      width={1440}
                      height={543}
                      sizes="100vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "bg-[var(--primary-color)] w-5"
                    : "bg-gray-300 w-2"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Static Banner Section */}
        <div className="md:col-span-3 hidden md:block relative rounded-lg overflow-hidden h-full w-full">
          <div className="absolute inset-0">
            <Image 
                src="/assets/images/download-app-banner-green.png" 
                alt="Download App" 
                className="w-full h-full object-cover rounded-lg"
                width={400}
                height={543}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageSlider;
