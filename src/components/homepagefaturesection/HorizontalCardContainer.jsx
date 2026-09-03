import React, { useEffect, useState } from 'react'
import HorizontalProductCard from '../productcards/HorizontalProductCard'
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { setFilterSection, setListingSource, } from '@/redux/slices/productFilterSlice';
import { t } from '@/utils/translation';
import { useRouter } from 'next/navigation';
import HomeOfferSection from './HomeOfferSection';
const HorizontalCardContainer = ({ section }) => {

    const router = useRouter();
    const dispatch = useDispatch();
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
        <section>
            {section?.products?.length > 0 ? <div className='container feature-section'>
                <div className='flex justify-between items-center mb-3'>
                    <div>
                        <h2 className='text-2xl font-bold'>{section?.translations?.title}</h2>
                        <p className='text-base font-[500] shortDescriptionText'>{section?.translations?.short_description}</p>
                    </div>

                    <div>
                        <button onClick={handleViewAll} className='hover:primaryColor'>{t("see_all")}</button>
                    </div>
                </div>
                <div className='grid grid-cols-4 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-12 mt-6 rounded-2xl gap-4 p-4 md:p-6 md:gap-4' style={theme == "light" ? { backgroundColor: section?.background_color_for_light_theme } : { backgroundColor: section?.background_color_for_dark_theme }}>
                    {section?.products?.slice(0, 6)?.map((product, index) => {
                        return (
                            <div key={index} className='col-span-4 '>
                                <HorizontalProductCard product={product} />
                            </div>
                        )
                    })}
                </div>
            </div> : null}
            <div className='container'>
                {promotionImage && promotionImage?.map((offer) => {
                    return (
                        <div className='relative w-full' key={offer?.id}>
                            <HomeOfferSection offer={offer} />
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export default HorizontalCardContainer