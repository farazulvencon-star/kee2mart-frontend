import React, { useEffect, useState } from 'react'
import VerticleProductCard from '../productcards/VerticleProductCard'
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { t } from '@/utils/translation';
import { useRouter } from 'next/navigation';
import { setFilterSection, setListingSource, } from '@/redux/slices/productFilterSlice';
import HomeOfferSection from './HomeOfferSection';

const VerticleCardContainer = ({ section }) => {

    const router = useRouter();
    const dispatch = useDispatch();
    const shop = useSelector(state => state.Shop.shop);
    const theme = useSelector(state => state.Theme.theme)
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
            {section?.products?.length > 0 ? <section className='' >
                <div className='container feature-section'>
                    <div className='flex justify-between items-center mb-3'>
                        <div>
                            <h2 className='text-2xl font-bold'>{section?.translations?.title}</h2>
                            <p className='text-base font-[500] shortDescriptionText'>{section?.translations?.short_description}</p>
                        </div>

                        <div>
                            <button className='hover:primaryColor' onClick={handleViewAll}>{t("see_all")}</button>
                        </div>
                    </div>
                    <div className='grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 mt-6 rounded-2xl verticle-card p-4 md:p-6 gap-2 md:gap-4' style={theme == "light" ? { backgroundColor: section?.background_color_for_light_theme } : { backgroundColor: section?.background_color_for_dark_theme }}>
                        {section?.products?.map((product, index) => {
                            return (
                                <div key={index}>
                                    <VerticleProductCard product={product}
                                    />
                                </div>
                            )
                        })}
                    </div>

                </div>
            </section> : null
            }
            {promotionImage && promotionImage?.map((offer, index) => {
                return (
                    <div className='container mb-6' key={index}>
                        <div className='relative' key={offer?.id}>
                            <HomeOfferSection offer={offer} />
                        </div>
                    </div>
                )
            })}
        </div>


    )
}

export default VerticleCardContainer