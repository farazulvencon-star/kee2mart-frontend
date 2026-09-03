import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import CategoryCard from "./CategoryCard";
import { t } from "@/utils/translation";

import "swiper/css";
import "swiper/css/navigation";

const SubCategorySwiper = ({
  title,
  subCategories,
  isLoading,
  languageType,
  rtl,
  onCategoryClick,
}) => {
  if (!subCategories.length) return null;

  return (
    <>
      <div className="flex justify-between gap-4">
        {title && (
          <div className="textColor text-xl font-extrabold !tracking-wide leading-[29px] m-0">
            <p>{title}</p>
          </div>
        )}
        <div className="flex  items-center p-0">
          <div className="flex gap-2">
            <button className="group category-button-next swiperBorderColor rounded-full !p-2 inline-block hover:primaryBackColor hover:text-white hover:primaryBorder">
              <IoMdArrowBack
                size={20}
                className="swiperNavButtonColor group-hover:text-white"
              />
            </button>
            <button className="group category-button-prev swiperBorderColor rounded-full !p-2 inline-block hover:primaryBackColor hover:text-white hover:primaryBorder">
              <IoMdArrowForward
                size={20}
                className="swiperNavButtonColor group-hover:text-white"
              />
            </button>
          </div>
        </div>
      </div>

      <div className="container" dir={languageType}>
        <div className="">
          <Swiper
            key={rtl}
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={1.5}
            navigation={{
              nextEl: ".category-button-prev",
              prevEl: ".category-button-next",
            }}
            breakpoints={{
              0: { slidesPerView: 2 },
              320: { slidesPerView: 2.5 },
              375: { slidesPerView: 2.5 },
              425: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 6 },
            }}
          >
            {isLoading ? (
              <SwiperSlide>
                <div className="p-4 text-sm opacity-60">{t("loading")}</div>
              </SwiperSlide>
            ) : (
              subCategories.map((category) => (
                <SwiperSlide
                  key={category.id}
                  onClick={() => onCategoryClick(category)}
                >
                  <CategoryCard category={category} imageSize={96} padding={8}/>
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default SubCategorySwiper;
