import React from "react";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useSelector } from "react-redux";
import { t } from "@/utils/translation";
import BlogCard from "./BlogCard";
import { isRtl } from "@/lib/utils";

const RecentBlogsSwiper = ({ recentBlogs }) => {
  const language = useSelector((state) => state.Language.selectedLanguage);
  const rtl = isRtl();

  return (
    <div>
      {recentBlogs?.length > 0 ? (
        <section className="backgroundColor">
          <div className="container feature-section">
            <div dir={language?.type}>
              <div className="flex justify-between items-center mb-3 ">
                <div className="w-full md:w-1/2">
                  <h2 className="textColor text-xl sm:text-3xl font-extrabold  leading-[29px] m-0">
                    {t("recentlyAddedBlogs")}
                  </h2>
                  <p className="shortDescriptionText">{t("recentlyAddedBlogsDesc")}</p>
                </div>
                <div className="flex  gap-0 md:gap-4 items-center flex-col md:flex-row">
                  <div
                    className={` md:flex hidden gap-2 ${
                      language?.type == "RTL" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <button
                      className={`group textColor swiperBorderColor rounded-full prev-blog-1 p-2 hover:primaryBackColor hover:text-white transition-all duration-200 ease-linear hover:primaryBorder`}
                    >
                      <IoMdArrowBack
                        className="swiperNavButtonColor group-hover:text-white transition-colors duration-200"
                        size={20}
                      />
                    </button>
                    <button
                      className={` group textColor swiperBorderColor rounded-full  next-blog-1 p-2 hover:primaryBackColor hover:text-white  transition-all duration-200 ease-linear hover:primaryBorder`}
                    >
                      <IoMdArrowForward
                        className=" swiperNavButtonColor group-hover:text-white transition-colors duration-200"
                        size={20}
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Swiper
                  key={rtl}
                  spaceBetween={20}
                  modules={[Navigation]}
                  className="brand-swiper"
                  navigation={{
                    prevEl: `.prev-blog-1`,
                    nextEl: `.next-blog-1`,
                  }}
                  breakpoints={{
                    1200: {
                      slidesPerView: 3,
                      spaceBetween: 10,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 10,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 10,
                    },
                    500: {
                      slidesPerView: 1.5,
                      spaceBetween: 10,
                    },
                    300: {
                      slidesPerView: 1,
                      spaceBetween: 10,
                    },
                  }}
                >
                  {recentBlogs?.map((blog, index) => (
                    <SwiperSlide key={blog.id} className="h-auto">
                      <BlogCard blog={blog} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default RecentBlogsSwiper;
