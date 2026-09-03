import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProductDetailSkeleton = () => {
  return (
    <div className="container px-2 mb-6 mt-1">
      <div className="flex flex-col justify-center">
        {/* Breadcrumb Skeleton */}
        <div className="py-4">
          <Skeleton width={200} height={20} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 mt-2 gap-4 items-start">
          {/* Image Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="relative aspect-square h-auto w-full">
              <Skeleton height="100%" />
            </div>
            <div className="mt-[10px] flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-1/4 aspect-square">
                  <Skeleton height="100%" />
                </div>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
            <div className="pb-6 border-b-2 flex flex-col gap-2">
              {/* Product Title */}
              <Skeleton width="80%" height={32} />
              
              <div className="flex gap-4 items-center flex-wrap pt-2">
                {/* Seller Info */}
                <div className="p-4 backgroundColor rounded-sm w-40">
                  <Skeleton height={20} />
                </div>
                {/* Rating */}
                <div className="w-32">
                  <Skeleton height={20} />
                </div>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-center gap-2">
              <Skeleton width={120} height={40} />
              <Skeleton width={80} height={24} />
            </div>

            {/* Variants Section */}
            <div className="flex flex-col gap-2">
              <Skeleton width={150} height={20} />
              <div className="grid grid-cols-12 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="col-span-6 md:col-span-4 lg:col-span-3">
                    <Skeleton height={50} />
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons Section */}
            <div className="flex gap-4 flex-col lg:flex-row pt-4">
              <div className="flex gap-4 items-center">
                {/* Quantity selector */}
                <div className="w-[120px]">
                  <Skeleton height={45} />
                </div>
                {/* Add to cart button */}
                <div className="w-48">
                  <Skeleton height={45} />
                </div>
              </div>
              {/* Wishlist button */}
              <div className="flex items-center gap-2 w-48">
                <Skeleton circle height={40} width={40} />
                <Skeleton width={120} height={20} />
              </div>
            </div>

            {/* Indicator IconsSection */}
            <div className="backgroundColor rounded-sm p-4 flex flex-col gap-4 mt-4">
               <div className="flex gap-3 items-center">
                  <Skeleton circle height={28} width={28} />
                  <Skeleton width={100} height={20} />
               </div>
               <div className="flex gap-3 items-center">
                  <Skeleton circle height={32} width={32} />
                  <Skeleton width={150} height={20} />
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
