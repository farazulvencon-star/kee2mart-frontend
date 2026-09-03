import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Section header: title + short description on the left, "see all" on the right
// (matches CategoriesContainer / VerticleCardContainer headers).
const SectionHeader = () => (
  <div className="flex justify-between items-center mb-3">
    <div className="flex flex-col gap-1">
      <Skeleton width={200} height={26} />
      <Skeleton width={140} height={16} />
    </div>
    <Skeleton width={70} height={20} />
  </div>
);

// Category card skeleton — matches CategoryCard: a rounded-2xl image box
// (h-20 md:h-28) with a 2-line label below.
const CategoryCardSkeleton = () => (
  <div className="flex flex-col items-center gap-2 w-full max-w-[96px] md:max-w-[121.5px] mx-auto">
    <div className="w-full h-20 md:h-28 leading-none">
      <Skeleton
        height="100%"
        borderRadius={16}
        containerClassName="block h-full leading-none"
      />
    </div>
    <Skeleton width="80%" height={14} count={2} />
  </div>
);

// Product card skeleton — matches VerticleProductCard: a square rounded-2xl
// image, then measurement, a 2-line title, price and discount.
const ProductCardSkeleton = () => (
  <div className="flex flex-col gap-3 w-full max-w-[170px]">
    <div className="relative w-full aspect-square">
      <Skeleton
        borderRadius={16}
        style={{ position: "absolute", inset: 0, height: "100%", width: "100%" }}
      />
    </div>
    <div className="flex flex-col gap-1.5">
      <Skeleton width={50} height={12} />
      <Skeleton height={16} width="90%" count={2} />
      <Skeleton width={70} height={14} />
      <Skeleton width={45} height={12} />
    </div>
  </div>
);

const ProductGridSection = ({ count = 12 }) => (
  <div className="container feature-section my-8">
    <SectionHeader />
    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 mt-6 rounded-2xl cardBorder p-4 md:p-6 gap-2 md:gap-4">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
    </div>
  </div>
);

const HomeSkeleton = () => {
  return (
    <section>
      <div className="md:mx-0">
        {/* Top Banner */}
        <div className="container promotion-image mb-6">
          <Skeleton height={120} borderRadius={12} className="w-full" />
        </div>

        {/* Main Slider */}
        <div className="container mb-8">
          <Skeleton height={300} borderRadius={16} className="w-full" />
        </div>

        {/* Below Slider Banner */}
        <div className="container promotion-image mb-6">
          <Skeleton height={120} borderRadius={12} className="w-full" />
        </div>

        {/* Categories (rounded-2xl boxes, 2 rows) */}
        <div className="container feature-section my-6">
          <SectionHeader />
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mt-6">
            {Array(12)
              .fill(0)
              .map((_, index) => (
                <CategoryCardSkeleton key={index} />
              ))}
          </div>
        </div>

        {/* Below Category Banner */}
        <div className="container promotion-image mb-6">
          <Skeleton height={120} borderRadius={12} className="w-full" />
        </div>

        {/* Product sections (new vertical card grid) */}
        <ProductGridSection count={12} />
        <ProductGridSection count={6} />
      </div>
    </section>
  );
};

export default HomeSkeleton;
