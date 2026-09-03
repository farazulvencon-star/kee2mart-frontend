import React from 'react'
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder'

const BrandCard = ({ brand, bgColor }) => {
    return (
        <div className="rounded-2xl max-w-[121.5px] flex flex-col items-center gap-2 cursor-pointer group">
            <div
                className={`self-stretch aspect-square p-3 rounded-2xl flex justify-center items-center overflow-hidden ${bgColor ? "" : "brandBackgroundColor"}`}
                style={bgColor ? { backgroundColor: bgColor } : undefined}
            >
                <ImageWithPlaceholder
                    src={brand?.image_url}
                    alt={brand?.translations?.name ?? brand?.name}
                    width={200}
                    height={200}
                    sizes="200px"
                    className="h-full w-full rounded-xl object-contain"
                />
            </div>
            <div className="self-stretch text-center textColor text-base font-normal line-clamp-2 group-hover:primaryColor transition-colors">
                {brand?.translations?.name ?? brand?.name}
            </div>
        </div>
    )
}

export default BrandCard