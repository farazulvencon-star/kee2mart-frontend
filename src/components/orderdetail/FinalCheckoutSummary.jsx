import { t } from "@/utils/translation";
import React, { useState } from "react";

import { useSelector } from "react-redux";
import { CgInfo } from "react-icons/cg";
import ChargesInfoPopup from "../checkoutpage/ChargesInfoPopup";

const FinalCheckoutSummary = ({ orderDetail }) => {
  const setting = useSelector((state) => state.Setting.setting);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [message, setMessage] = useState("");
  return (
    <div className="max-w-md p-6 rounded-md border cartBorder ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg  font-medium">{t("payment_method")}</h2>
        <span className="font-semibold">{orderDetail?.payment_method}</span>
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          {orderDetail?.transaction_id != 0 && (
            <div className="flex justify-between items-center">
              <span className="">{t("transaction_id")}</span>
              <span className="font-semibold">
                {orderDetail?.transaction_id}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="">{t("sub_total")}</span>
            <span className="font-semibold">
              {setting?.currency}
              {Number(orderDetail?.remaining_total)}
            </span>
          </div>

          {orderDetail?.additional_charges?.length > 0
            ? orderDetail?.additional_charges?.map((charge, index) => {
                return (
                  <div
                    className="flex justify-between items-center my-2"
                    key={index}
                  >
                    <span className="flex items-center relative">{charge?.title} 
                      <span className="ml-1 subTextColor cursor-pointer" onClick={() => {
                        setMessage(charge?.is_refundable ? t("refundable_message") : t("non_refundable_message"));
                        setActiveTooltip(index);
                      }}>
                        <CgInfo />
                      </span>
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
          {orderDetail?.order_type == "doorstep" && (
            <div className="flex justify-between items-center">
              <span className="flex items-center relative">
                {t("delivery_charge")}
                <span className="ml-1 subTextColor cursor-pointer" onClick={() => {
                  setMessage(
                                <div className="flex flex-col gap-2">
                                  <span className="font-semibold">{t("delivery_charge_details")}</span>
                                  <span className={`text-xs mt-1`}>
                                    {orderDetail?.is_delivery_charges_refundable == 1 ? t("refundable_message") : t("non_refundable_message")}
                                  </span>
                                </div>
                              );
                  setActiveTooltip('delivery');
                }}>
                  <CgInfo />
                </span>
                {activeTooltip === 'delivery' && (
                  <ChargesInfoPopup message={message} onClose={() => setActiveTooltip(null)} />
                )}
              </span>
              <span className="font-semibold">
                {setting?.currency}
                {orderDetail?.delivery_charge}
              </span>
            </div>
          )}

          {orderDetail?.promo_discount != 0 && (
            <div className="flex justify-between items-center">
              <span className="">{t("promoDiscount")}</span>
              <span className="font-semibold">
                - {setting?.currency}
                {orderDetail?.promo_discount?.toFixed(
                  setting?.decimal_point ? setting?.decimal_point : 0
                )}
              </span>
            </div>
          )}

          {orderDetail?.wallet_balance != 0 && (
            <div className="flex justify-between items-center">
              <span className="">{t("walletBalance")}</span>
              <span className="font-semibold">
                - {setting?.currency}
                {orderDetail?.wallet_balance?.toFixed(
                  setting?.decimal_point ? setting?.decimal_point : 0
                )}
              </span>
            </div>
          )}

          <div className="pt-4 border-t ">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base">
                {t("total")} {t("amount")}
              </span>
              <span className="text-green-600 font-bold">
                {setting?.currency}
                {Number(orderDetail?.remaining_final)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalCheckoutSummary;
