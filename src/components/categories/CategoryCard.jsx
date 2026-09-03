import React from "react";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";

const CategoryCard = ({ category, bgColor }) => {
  return (
    <div className="rounded-2xl inline-flex flex-col justify-start items-center gap-2 cursor-pointer w-full max-w-[96px] md:max-w-[121.5px]">
      <div
        className={`h-20 md:h-28 p-2 rounded-2xl inline-flex justify-start items-center gap-2.5 ${
          bgColor ? "" : "bg-transparent"
        }`}
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <ImageWithPlaceholder
          src={category.image_url}
          width={300}
          height={300}
          alt="Category Image"
          className="flex-1 h-[64px] w-[64px] md:h-[105.5px] md:w-[105.5px] object-contain"
        />
      </div>
      <div className="self-stretch text-center textColor text-sm md:text-base font-medium leading-5 md:leading-6 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
        {category?.translations?.name ?? category?.name}
      </div>
    </div>
  );
};

export default CategoryCard;
