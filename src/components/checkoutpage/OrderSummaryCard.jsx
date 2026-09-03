import { t } from "@/utils/translation";
import { LocalizedLink } from "@/utils/localizedNav";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { setCheckoutTotal } from "@/redux/slices/checkoutSlice";
import { useDispatch } from "react-redux";
import { CgInfo } from "react-icons/cg";
import ChargesInfoPopup from "./ChargesInfoPopup";

const OrderSummaryCard = ({
  step,
  checkoutData,
  handlePlaceOrder,
  checkOutError,
  checkoutLoading,
}) => {
  const dispatch = useDispatch();
  const setting = useSelector((state) => state.Setting.setting);
  const user = useSelector((state) => state.User);
  const checkout = useSelector((state) => state.Checkout);
  const cart = useSelector((state) => state.Cart);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Calculate new total amount based on wallet balance usage
    if (checkout?.isWalletChecked) {
      const updatedTotal = Math.max(
        (checkoutData?.total_amount || 0) - (user?.user?.balance || 0),
        0 // Ensure total doesn't go below 0
      );
      dispatch(setCheckoutTotal({ data: updatedTotal }));
    } else {
      dispatch(setCheckoutTotal({ data: checkoutData?.total_amount || 0 }));
      // setCheckoutTotal(checkoutData?.total_amount || 0); // Reset to original total
    }
  }, [
    checkout?.isWalletChecked,
    checkoutData?.total_amount,
    user?.user?.balance,
  ]);

  return (
    <div className="w-full mx-auto cardBorder rounded-lg p-6 ">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold ">{t("sub_total")}</span>
        {checkOutError == false ? (
          <span className="font-semibold ">
            {setting?.currency}{" "}
            {checkoutData?.sub_total?.toFixed(
              setting?.decimal_point ? setting?.decimal_point : 0
            )}
          </span>
        ) : (
          <span className="font-semibold ">
            {setting?.currency}{" "}
            {cart?.cartSubTotal?.toFixed(
              setting?.decimal_point ? setting?.decimal_point : 0
            )}
          </span>
        )}
      </div>

      {checkoutData?.additional_charges?.length > 0
        ? checkoutData?.additional_charges?.map((charge, index) => {
            return (
              <div
                className="flex justify-between items-center my-2"
                key={index}
              >
                <span className="flex items-center relative">{charge?.title} <span className="ml-1 subTextColor cursor-pointer" onClick={() => {
                  setMessage(charge?.is_refundable ? t("refundable_message") : t("non_refundable_message"));
                  setActiveTooltip(index);
                }}><CgInfo /></span>
                  {activeTooltip === index && (
                    <ChargesInfoPopup message={message} onClose={() => setActiveTooltip(null)} />
                  )}
                </span>
                <span className="font-semibold">
                  {setting?.currency}
                  {charge?.amount}
                </span>
              </div>
            );
          })
        : null}
      {checkOutError == false && checkout?.orderType == "doorstep" && (
        <div className="flex justify-between items-center mb-2">

          <span className="flex items-center wrap relative"><span className="flex flex-wrap">{t("delivery_charge")}</span>  <span className="ml-1 subTextColor cursor-pointer" onClick={()=>{
            setMessage(
              <div className="flex flex-col gap-2">
                <span className="font-semibold">{t("delivery_charge_details")}</span>
                {checkoutData?.delivery_charge?.sellers_info?.map((seller, i) => (
                  <div key={i} className="flex justify-between items-center text-xs gap-4">
                    <span className="">{seller.seller_name}</span>
                    <span className="font-medium whitespace-nowrap">{setting?.currency} {seller.delivery_charge}</span>
                  </div>
                ))}
                <span className={`text-xs mt-1`}>
                  {checkoutData?.delivery_charge?.is_delivery_charges_refundable == 1 ? t("refundable_message") : t("non_refundable_message")}
                </span>
              </div>
            );
            setActiveTooltip('delivery');
          }}><CgInfo /></span>
            {activeTooltip === 'delivery' && (
              <ChargesInfoPopup message={message} onClose={() => setActiveTooltip(null)} />
            )}
          </span>
          <span className=" flex flex-nowrap">
            <span>{setting?.currency}{" "}</span>
            <span>
            {checkoutData?.delivery_charge?.total_delivery_charge}
            </span>
          </span>
        </div>
      )}

      {checkoutData?.promocode_details && checkOutError == false && (
        <div className="flex justify-between items-center mb-2">
          <a href="#" className="">
            {t("promoDiscount")}
          </a>
          <span className="">
            - {setting?.currency} {checkoutData?.promocode_details?.discount}
          </span>
        </div>
      )}
      {checkout?.isWalletChecked && (
        <div className="flex justify-between items-center mb-2">
          {t("wallet_balance_used")}

          <span className="">
            - {setting?.currency}{" "}
            {checkout?.usedWalletBalance?.toFixed(
              setting?.decimal_point ? setting?.decimal_point : 0
            )}
          </span>
        </div>
      )}
      <hr className="border-gray-300 mb-4" />
      <div className="flex justify-between items-center mb-6 backgroundColor p-3 rounded-sm">
        <span className="text-lg font-bold ">{t("total")}</span>
        {checkOutError == false ? (
          <span className="font-semibold ">
            {setting?.currency}{" "}
            {checkout?.isWalletChecked
              ? (
                  Number(checkoutData?.total_amount) -
                  Number(checkout?.usedWalletBalance)
                ).toFixed(setting?.decimal_point ? setting?.decimal_point : 0)
              : checkoutData?.total_amount?.toFixed(
                  setting?.decimal_point ? setting?.decimal_point : 0
                )}
          </span>
        ) : (
          <span className="font-semibold ">
            {setting?.currency}{" "}
            {cart?.cartSubTotal?.toFixed(
              setting?.decimal_point ? setting?.decimal_point : 0
            )}
          </span>
        )}
      </div>
      <button
        className="w-full primaryBackColor text-white font-semibold py-2 rounded-md  disabled:iconBackgroundColor disabled:cursor-not-allowed disabled:fontColor"
        disabled={step !== 3 || checkoutLoading}
        onClick={handlePlaceOrder}
      >
        {t("place_order")}
      </button>
      <div className="text-center rounded w-full hover:primaryBackColor hover:text-white p-2 mt-2">
        <LocalizedLink href="/cart" className=" underline font-medium  w-full ">
          {t("backToCart")}
        </LocalizedLink>
      </div>
      {/* Global popup removed since we render tooltips inline */}
    </div>

  );
};

export default OrderSummaryCard;
