import React, { useEffect, useState } from 'react'
import { IoMdArrowBack, IoMdArrowForward } from 'react-icons/io'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import VerticleProductCard from '../productcards/VerticleProductCard';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { setFilterSection, setListingSource, } from '@/redux/slices/productFilterSlice';

import { useRouter } from 'next/router';
import { t } from '@/utils/translation';
import { isRtl } from '@/lib/utils';
import HomeOfferSection from './HomeOfferSection';

const HorizontalProductSwiper = ({ section, index }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const rtl = isRtl()
    const shop = useSelector(state => state.Shop.shop);
    const theme = useSelector(state => state.Theme.theme)
    const language = useSelector(state => state.Language.selectedLanguage)
    const [promotionImage, setPromotionImage] = useState(null)
    useEffect(() => {
        const promotionImageBelowSection = shop?.offers?.filter((offer) => offer?.position == "below_section");
        const image = promotionImageBelowSection?.filter((offer) => {
            return offer?.section?.id == section?.id
        })
        setPromotionImage(image)
    }, [section])

    const handleViewAll = () => {
        dispatch(setFilterSection({ data: section?.id }))
        dispatch(setListingSource({ data: "all" }));
        router.push("/products")
    }

    return (
        <div>
            {
                section?.products?.length > 0 ?
                    <section className='' >

                        <div className='container feature-section'>
                            <div dir={language?.type}>
                                <div className='flex justify-between items-center mb-3 '>
                                    <div className='w-1/2'>
                                        <h2 className='textColor text-xl sm:text-3xl font-extrabold  leading-[29px] m-0'>{section?.translations?.title}</h2>
                                        <p className='shortDescriptionText'>{section?.translations?.short_description}</p>
                                    </div>
                                    <div className='flex  gap-0 md:gap-4 items-center flex-col md:flex-row'>
                                        <button onClick={handleViewAll} className='hover:primaryColor'>{t("see_all")}</button>
                                        <div className={` md:flex hidden gap-2 ${language?.type == "RTL" ? "flex-row-reverse" : ""}`} >
                                            <button className={`group textColor swiperBorderColor rounded-full prev-btn-${section?.id} p-2 hover:primaryBackColor hover:text-white transition-all duration-200 ease-linear hover:primaryBorder`}>
                                                <IoMdArrowBack className='swiperNavButtonColor group-hover:text-white transition-colors duration-200' size={20} />
                                            </button>
                                            <button className={` group textColor swiperBorderColor rounded-full  next-btn-${section?.id} p-2 hover:primaryBackColor hover:text-white  transition-all duration-200 ease-linear hover:primaryBorder`}><IoMdArrowForward className=' swiperNavButtonColor group-hover:text-white transition-colors duration-200' size={20} /></button>
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-6 p-4 md:p-6 rounded-2xl overflow-hidden' style={theme == "light" ? { backgroundColor: section?.background_color_for_light_theme } : { backgroundColor: section?.background_color_for_dark_theme }}>
                                    <Swiper
                                        key={rtl}
                                        spaceBetween={20}
                                        modules={[Navigation]}
                                        className="brand-swiper"
                                        navigation={
                                            {
                                                prevEl: `.prev-btn-${section?.id}`,
                                                nextEl: `.next-btn-${section?.id}`
                                            }
                                        }
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
                                                slidesPerView: 2.5,
                                                spaceBetween: 10
                                            },
                                        }}
                                    >
                                        {section?.products?.map((product, index) => (
                                            <SwiperSlide key={product.id} className='h-auto'>
                                                <VerticleProductCard product={product} />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            </div>
                        </div>
                    </section>
                    : null
            }
            {promotionImage && promotionImage?.map((offer) => {
                return (
                    <div className='container mb-6' key={offer?.id}>
                        <div className='relative' >
                            <HomeOfferSection offer={offer} />
                        </div>
                    </div>
                )
            })}
        </div>


    )
}

export default HorizontalProductSwiper