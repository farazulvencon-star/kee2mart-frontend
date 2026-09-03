import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { t } from '@/utils/translation';
import VerticleProductCard from '../productcards/VerticleProductCard';
import * as api from "@/api/apiRoutes"
import { useSelector } from 'react-redux';
import { isRtl } from '@/lib/utils';
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";

const SimilarProducts = ({ slug, tag_names }) => {
    const rtl = isRtl()
    const city = useSelector(state => state.City.city)
    const language = useSelector(state => state.Language.selectedLanguage)

    const [similarProducts, setSimilarProducts] = useState([])
    const [totalSimilarProducts, setTotalSimilarProducts] = useState(0)
    const [offset, setOffset] = useState(0)


    const productPerPage = 10;

    useEffect(() => {
        if (tag_names && city) {
            handleFetchSimilarProducts(tag_names)
        }
    }, [offset, city])

    const handleFetchSimilarProducts = async (localTagNames) => {
        try {
            const response = await api.getProductByFilter({ latitude: city?.latitude, longitude: city?.longitude, tag_names: localTagNames, slug: slug })
            setSimilarProducts(response.data)
            setTotalSimilarProducts(response.total)
        } catch (error) {
            console.log("Error", error)
        }
    }

    const handleLoadMore = () => {
        if (totalSimilarProducts > similarProducts?.length) {
            setOffset(offset => offset + productPerPage)
        } else {
            return
        }
    }

    return (
        similarProducts?.length > 0 ?
            <section className='backgroundColor'>
                <div className='container py-12 px-2' dir={language?.type}>
                    <div className={`flex flex-col gap-2 ${language?.type == "RTL" ? "flex-row-reverse" : ""}`} >
                        <div className='font-bold text-xl rounded-sm my-2 flex justify-between items-center'>
                            <h2>{t("related_product")}</h2>
                            <div
                                className={` flex  gap-2 ${language?.type == "RTL" ? "flex-row-reverse" : ""}`}
                            >
                                <button className=" group category-button-next swiperBorderColor rounded-full  !p-2 inline-block text-[15px] relative right-[5%] top-0 transition-all duration-200 ease-linear visibility-visible z-10 hover:primaryBackColor hover:text-white hover:primaryBorder">
                                    <IoMdArrowBack
                                        className="swiperNavButtonColor group-hover:text-white transition-colors duration-200"
                                        size={20}
                                    />
                                </button>
                                <button className=" group category-button-prev swiperBorderColor rounded-full   !p-2 inline-block text-[15px] relative right-[5%] top-0 transition-all duration-200 ease-linear visibility-visible z-10 hover:primaryBackColor hover:text-white hover:primaryBorder">
                                    <IoMdArrowForward
                                        className="swiperNavButtonColor group-hover:text-white transition-colors duration-200"
                                        size={20}
                                    />
                                </button>
                            </div>
                        </div>
                        <div>
                            <Swiper
                                key={rtl}
                                spaceBetween={20}
                                modules={[Navigation]}
                                className="brand-swiper"
                                onReachEnd={handleLoadMore}
                                navigation={{
                                    nextEl: ".category-button-prev",
                                    prevEl: ".category-button-next",
                                }}
                                breakpoints={{

                                    1200: {
                                        slidesPerView: 6.5,
                                        spaceBetween: 10
                                    },
                                    1024: {
                                        slidesPerView: 4.5,
                                        spaceBetween: 10
                                    },
                                    768: {
                                        slidesPerView: 3.3,
                                        spaceBetween: 10
                                    },
                                    500: {
                                        slidesPerView: 2,
                                        spaceBetween: 10
                                    },
                                    300: {
                                        slidesPerView: 1.5,
                                        spaceBetween: 10
                                    },
                                }}
                            >
                                {similarProducts?.map((product, index) => (
                                    <SwiperSlide
                                        key={product.id}
                                        className={index === similarProducts.length - 1 ? 'last-slide' : ''}
                                    >
                                        <VerticleProductCard product={product} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>

                </div>
            </section>
            : null
    )
}

export default SimilarProducts