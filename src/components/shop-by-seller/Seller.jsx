import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { isRtl } from "@/lib/utils";
import { t } from "@/utils/translation";

const Seller = ({ seller }) => {
  const rtl = isRtl();
  const productCount = seller?.total_products;
  return (
    <div
      className={`group  relative flex items-center headerBackgroundColor p-4 rounded-md flex-row overflow-hidden hover:text-white  hover:cursor-pointer `}
    >
      <div
        className={`absolute inset-0   primaryBackColor ${rtl ? "translate-x-full" : "-translate-x-full"} group-hover:translate-x-0 transition-transform duration-500 ease-in-out`}
      />
      <div className="relative z-10 flex flex-row items-center gap-4">
        <div className="relative h-[80px] w-[80px]">
          <ImageWithPlaceholder
            src={seller?.logo_url}
            alt={seller?.translations?.name}
            fill
            sizes="80px"
            className="rounded-md object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="text-xl font-bold leading-6 line-clamp-2 group-hover:text-white">
            {seller?.translations?.store_name}
          </div>
          {productCount != null ? (
            <div className="opacity-40 textColor text-sm font-normal leading-4 line-clamp-1">
              {productCount > 50 ? "50+" : productCount}{" "}
              {productCount === 1 ? t("product") : t("products")}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Seller;
