import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { t } from "@/utils/translation";

const SellerListingCard = ({ seller }) => {
  const productCount = seller?.total_products;

  return (
    <div className="w-full p-4 bg-white rounded-lg border border-zinc-200 hover:primaryColorBorder hover:shadow-sm transition-all duration-300 flex justify-start items-center gap-4 group cursor-pointer headerBackgroundColor">
      <ImageWithPlaceholder
        src={seller?.logo_url}
        width={160}
        height={160}
        alt={seller?.translations?.store_name ?? "Seller"}
        className="size-20 shrink-0 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="text-xl font-bold leading-6 line-clamp-2">
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
  );
};

export default SellerListingCard;
