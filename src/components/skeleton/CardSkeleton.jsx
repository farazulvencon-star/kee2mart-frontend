import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CardSkeleton = ({ height, width = "100%", padding, variant }) => {
    // Vertical / grid product card skeleton
    if (variant === "grid") {
        return (
            <div className="flex flex-col gap-3 w-full">
                <Skeleton
                    containerClassName="block w-full aspect-square"
                    className="!w-full !h-full !rounded-2xl"
                />
                <div className="flex flex-col gap-1.5">
                    <Skeleton width={90} height={14} />
                    <Skeleton width="80%" height={18} />
                    <Skeleton width={70} height={14} />
                    <Skeleton width={55} height={14} />
                </div>
            </div>
        );
    }

    // List view product card skeleton
    if (variant === "list") {
        return (
            <div className="flex bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="flex-1 p-4 flex flex-col gap-2">
                    <Skeleton width={90} height={14} />
                    <Skeleton width="70%" height={22} />
                    <Skeleton width={90} height={16} />
                    <Skeleton width={60} height={14} />
                </div>
                <div className="w-32 shrink-0 p-2">
                    <Skeleton
                        containerClassName="block w-full h-full min-h-[120px]"
                        className="!w-full !h-full !rounded-2xl"
                    />
                </div>
            </div>
        );
    }

    // Legacy generic skeleton
    return (
        <div className={`flex  w-full ${padding}`}>
            <div className="w-full border rounded-lg cardBorder p-4">
                <Skeleton height={height} width={width} />
            </div>
        </div>
    );
};

export default CardSkeleton;