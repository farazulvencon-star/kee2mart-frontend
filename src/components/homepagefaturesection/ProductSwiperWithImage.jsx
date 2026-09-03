import Image from 'next/image'

import React, { useEffect, useState } from 'react'
import { IoMdArrowBack, IoMdArrowForward } from 'react-icons/io'

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import VerticleProductCard from '../productcards/VerticleProductCard';
import { useSelector, useDispatch } from 'react-redux'
import { t } from '@/utils/translation'
import { setFilterSection, setListingSource, } from '@/redux/slices/productFilterSlice';
import { useRouter } from 'next/navigation'
import { isRtl } from '@/lib/utils'
import HomeOfferSection from './HomeOfferSection';

const ProductSwiperWithImage = ({ section }) => {
    const router = useRouter();
    const rtl = isRtl()
    const dispatch = useDispatch();
    const language = useSelector(state => state.Language.selectedLanguage)
    const theme = useSelector(state => state.Theme.theme)
    const shop = useSelector(state => state.Shop.shop);
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
        router.push('/products')
    }

    return (
        <div>
            {section?.products?.length > 0 ? (
                <section>
                    <div className='container feature-section'>
                        <div dir={language?.type} className='flex flex-col gap-6'>
                            {/* Header */}
                            <div className='flex justify-between items-center gap-4'>
                                <div className='flex flex-col'>
                                    <h2 className='textColor text-2xl font-bold leading-7 m-0'>{section?.translations?.title}</h2>
                                    <p className='shortDescriptionText text-base font-medium leading-6'>{section?.translations?.short_description}</p>
                                </div>
                                <div className='flex justify-end items-center gap-4'>
                                    <button onClick={handleViewAll} className='opacity-75 text-base font-medium hover:primaryColor hover:opacity-100 transition'>{t("see_all")}</button>
                                    <div className={`md:flex hidden items-center gap-2 ${language?.type == "RTL" ? "flex-row-reverse" : ""}`}>
                                        <button className={`group p-1.5 rounded-full border border-slate-400 hover:primaryBackColor hover:border-transparent transition-all duration-200 ease-linear prev-btn-${section?.id}`}><IoMdArrowBack className='text-slate-400 group-hover:text-white transition-colors duration-200' size={20} /></button>
                                        <button className={`group p-1.5 rounded-full border border-slate-400 hover:primaryBackColor hover:border-transparent transition-all duration-200 ease-linear next-btn-${section?.id}`}><IoMdArrowForward className='text-slate-400 group-hover:text-white transition-colors duration-200' size={20} /></button>
                                    </div>
                                </div>
                            </div>
                            {/* Body: image card + products (dynamic background) */}
                            <div className='flex flex-col md:flex-row items-stretch gap-6 image-card'>
                                {/* Image card */}
                                <div className='relative w-full md:w-60 shrink-0 self-stretch rounded-2xl overflow-hidden bg-stone-50 h-80 md:h-auto md:min-h-0'>
                                    <Image src={section?.banner_web_url} fill sizes="(max-width: 768px) 100vw, 240px" priority={true} quality={85} alt={section?.translations?.title} className='object-fit' />
                                </div>
                                {/* Products with dynamic background */}
                                <div className='flex-1 min-w-0 p-4 md:p-6 rounded-2xl overflow-hidden' style={theme == "light" ? { backgroundColor: section?.background_color_for_light_theme } : { backgroundColor: section?.background_color_for_dark_theme }}>
                                    {/* Mobile: grid (swiper hidden) */}
                                    {/* <div className='grid grid-cols-3 gap-3 md:hidden'>
                                        {section?.products?.slice(0, 6).map((product) => (
                                            <VerticleProductCard key={product.id} product={product} />
                                        ))}
                                    </div> */}
                                    {/* Desktop/Tablet: swiper */}
                                    <div className=' md:block'>
                                    <Swiper
                                        key={rtl}
                                        spaceBetween={24}
                                        modules={[Navigation]}
                                        navigation={
                                            {
                                                prevEl: `.prev-btn-${section?.id}`,
                                                nextEl: `.next-btn-${section?.id}`
                                            }
                                        }
                                        className="brand-swiper"
                                        breakpoints={{
                                            1200: { slidesPerView: 5.5 },
                                            1024: { slidesPerView: 4.5 },
                                            768: { slidesPerView: 2.5 },
                                            500: { slidesPerView: 2.5 },
                                            300: { slidesPerView: 2.5 },
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
                        </div>
                    </div>
                </section>
            ) : null}
            {promotionImage && promotionImage?.map((offer, index) => {
                return (
                    <div className='container mb-6' key={index}>
                        <div div className='relative' key={offer?.id}>
                            <HomeOfferSection offer={offer} />
                        </div>
                    </div>
                )
            })}
        </div>


    )
}

export default ProductSwiperWithImage