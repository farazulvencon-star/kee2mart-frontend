import { t } from "@/utils/translation";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import CancelReasonModal from "./CancelReasonModal";
import ReturnReasonModal from "./ReturnReasonModal";
import { MdOutlineStar } from "react-icons/md";
import ProductRatingModal from "./ProductRatingModal";
import { IoMdStar } from "react-icons/io";
import RatingUpdateModal from "./RatingUpdateModal";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";

const OrderItems = ({
  products,
  handleFetchOrderDetail,
  isShowProductRating,
}) => {
  const setting = useSelector((state) => state.Setting.setting);
  const user = useSelector((state) => state.User.user);

  const [selectedProduct, setSelectedProduct] = useState([]);
  const [showCancelMoodal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showUpdateRating, setShowUpdateRating] = useState(false);
  const [ratingId, setRatingId] = useState(null);

  const handleCancel = (product) => {
    setSelectedProduct(product);
    setShowCancelModal(true);
  };

  const handleReturn = (product) => {
    setSelectedProduct(product);
    setShowReturnModal(true);
  };

  const handleShowRating = (product) => {
    setSelectedProduct(product);
    setShowRating(true);
  };

  const handleShowUpdateRating = (product) => {
    const rating = product?.item_rating?.find(
      (rating) => rating?.user_id == user?.id,
    );
    const ratingId = rating?.id;
    setRatingId(ratingId);
    setShowUpdateRating(true);
  };

  const showAction = products?.some((product) => {
    const canCancel =
      Number(product?.active_status) <= 6 &&
      Number(product?.active_status) <= Number(product?.till_status) &&
      Number(product?.cancelable_status) === 1;

    const canReturn =
      Number(product?.active_status) === 6 &&
      Number(product?.return_status) === 1 &&
      product?.return_requested === null;

    return canCancel || canReturn;
  });

  // Returns true when a product is cancelled (active_status=7, cancelable_status=0)
  // Used to show the Action column header even when no cancel/return action is available
  const showStatus = products?.some(
    (product) =>
      Number(product?.active_status) === 7 &&
      Number(product?.cancelable_status) === 0
  );

  return (
    <div className="rounded-md cardBorder overflow-auto">
      <div className="hidden lg:flex">
        <table className="table-auto w-full rounded-md min-w-[600px]">
          <thead className="backgroundColor ">
            <tr>
              <th className="text-left p-4 border-b ">{t("product")}</th>
              <th className="text-left p-4 border-b ">{t("price")}</th>
              {(showAction || showStatus) && (
                <th className="text-left p-4 border-b">
                  {showAction ? t("action") : t("status")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => {
              const userRating = product?.item_rating?.find(
                (rating) => rating?.user?.id === user?.id,
              );
              return (
                <tr key={product?.id} className="border-b last:border-b-0 ">
                  <td className="p-4 flex items-center gap-4">
                    <div className="relative p-1 rounded-sm flex-shrink-0 cardBorder">
                      <ImageWithPlaceholder
                        src={product?.image_url}
                        alt="Products"
                        width={64}
                        height={64}
                        className="w-16 h-16 backColor"
                      />
                    </div>

                    <div className="max-w-full overflow-hidden">
                      <h2 className="font-bold truncate">{product?.name}</h2>
                      <p className="text-sm ">{`${product?.variant_name} x ${product?.quantity}`}</p>
                      {Number(product?.return_requested) === 1 && (
                        <button className="text-[#DB9305]">
                          {t("return_requested")}
                        </button>
                      )}
                      {Number(product?.return_requested) === 4 && (
                        <button className="text-[#0DCaf0]">
                          {t("delivery_boy_assinged")}
                        </button>
                      )}
                      {Number(product?.return_requested) === 5 && (
                        <button className="text-[#0d6efd]">
                          {t("deliver_boy_out_for_pickup")}
                        </button>
                      )}
                      {Number(product?.return_requested) === 6 && (
                        <button className="text-[#6C757D]">
                          {t("item_received_from_customer")}
                        </button>
                      )}
                      {Number(product?.return_requested) === 7 && (
                        <>
                          <button className="text-[#DB3D26]">
                            {t("return_request_cancel_by_delivery_boy")}
                          </button>
                          <p className="text-xs">{`${t("sellerNote")}: ${product?.cancellation_reason
                            }`}</p>
                        </>
                      )}
                      {Number(product?.return_requested) === 8 && (
                        <button className="text-[#212529]">
                          {t("item_returned_to_seller")}
                        </button>
                      )}
                      {Number(product?.active_status) === 8 && (
                        <span className="text-[#DB3D26]">{`${t("total")} ${setting?.currency
                          }${product?.refund_amount} ${t("refunded")}`}</span>
                      )}
                      {Number(product?.return_requested) === 3 && (
                        <>
                          <button className=" text-red-500 ">
                            {t("return_rejected")}
                          </button>
                          <p className="text-xs">{`${t("sellerNote")}: ${product?.return_remarks
                            }`}</p>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold">
                      {setting?.currency}
                      {(product?.discounted_price !== 0
                        ? product?.discounted_price
                        : product?.price
                      )?.toFixed(
                        setting?.decimal_point ? setting?.decimal_point : 0,
                      )}
                    </p>
                  </td>
                  {(showAction || showStatus) && (
                    <td className="p-4 ">
                      <div className="flex gap-2 flex-col items-start">
                        {Number(product?.active_status) === 6 &&
                          isShowProductRating &&
                          product?.return_requested === null ? (
                          userRating ? (
                            <div
                              className="flex items-center flex-col px-1 cursor-pointer"
                              onClick={() => handleShowUpdateRating(product)}
                            >
                              <button
                                className="px-4 py-2 hover:bg-[#6ac8931f] text-[#141A1F] bg-[#DB93051F] rounded-md flex gap-1 items-center font-medium text-sm "
                                onClick={() => handleShowUpdateRating(product)}
                              >
                                {t("edit_review")} | {userRating?.rate}
                                <IoMdStar size={20} fill="#DB9305" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <button
                                className="px-4 py-2 hover:bg-[#6ac8931f] text-[#55AE7B] bg-[#55AE7B1F] rounded-md flex gap-1 items-center font-medium text-base"
                                onClick={() => handleShowRating(product)}
                              >
                                <MdOutlineStar size={20} />
                                {t("rate")}
                              </button>
                            </div>
                          )
                        ) : (
                          <></>
                        )}

                        <div className="">
                          {Number(product?.active_status) <= 6 &&
                            Number(product?.active_status) <=
                            Number(product?.till_status) &&
                            Number(product?.cancelable_status) === 1 && (
                              <button
                                className="px-4 py-2 text-red-500 bg-[#DB3D261F] rounded-md hover:bg-red-200"
                                onClick={() => handleCancel(product)}
                              >
                                {t("cancel")}
                              </button>
                            )}

                          {Number(product?.active_status) === 6 &&
                            Number(product?.return_status) === 1 &&
                            product?.return_requested === null && (
                              <button
                                className="text-[#DB3D26] underline"
                                onClick={() => handleReturn(product)}
                              >
                                {t("return")}
                              </button>
                            )}

                          {Number(product?.active_status) === 7 &&
                            Number(product?.cancelable_status) === 0 && (
                            <div className="flex flex-col gap-1">
                              <button
                                className="px-4 py-2 text-red-500 bg-[#DB3D261F] rounded-md"
                                disabled
                              >
                                {t("cancelled")}
                              </button>
                              {product?.cancellation_reason && (
                                <p className=" text-red-500 text-sm">
                                  <span className="font-bold text-sm text-red-500">{`${t("cancel_reason")} `}</span>{`${product.cancellation_reason}`}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col lg:hidden ">
        {products?.map((product) => {
          const userRating = product?.item_rating?.find(
            (rating) => rating?.user?.id === user?.id,
          );
          return (
            <div key={product?.id} className="p-4 w-full flex flex-col gap-4 bottomBorder">
              <div className="flex gap-2">
                <div className="relative p-1 rounded-sm flex-shrink-0 cardBorder">
                  <ImageWithPlaceholder
                    src={product?.image_url}
                    alt="Products"
                    width={48}
                    height={48}
                    className="w-12 h-12 backColor "
                  />
                </div>
                <div className="max-w-full overflow-hidden">
                  <h2 className="font-bold truncate">{product?.name}</h2>
                  <p className="text-sm ">{`${product?.variant_name} x ${product?.quantity}`}</p>
                  {Number(product?.return_requested) === 1 && (
                    <button className="text-[#DB9305]">
                      {t("return_requested")}
                    </button>
                  )}
                  {Number(product?.return_requested) === 4 && (
                    <button className="text-[#0DCaf0]">
                      {t("delivery_boy_assinged")}
                    </button>
                  )}
                  {Number(product?.return_requested) === 5 && (
                    <button className="text-[#0d6efd]">
                      {t("deliver_boy_out_for_pickup")}
                    </button>
                  )}
                  {Number(product?.return_requested) === 6 && (
                    <button className="text-[#6C757D]">
                      {t("item_received_from_customer")}
                    </button>
                  )}
                  {Number(product?.return_requested) === 7 && (
                    <>
                      <button className="text-[#DB3D26]">
                        {t("return_request_cancel_by_delivery_boy")}
                      </button>
                      <p className="text-xs">{`${t("sellerNote")}: ${product?.cancellation_reason
                        }`}</p>
                    </>
                  )}
                  {Number(product?.return_requested) === 8 && (
                    <button className="text-[#212529]">
                      {t("item_returned_to_seller")}
                    </button>
                  )}
                  {Number(product?.active_status) === 8 && (
                    <span className="text-[#DB3D26]">{`${t("total")} ${setting?.currency
                      }${product?.refund_amount} ${t("refunded")}`}</span>
                  )}
                  {Number(product?.return_requested) === 3 && (
                    <>
                      <button className=" text-red-500 ">
                        {t("return_rejected")}
                      </button>
                      <p className="text-xs">{`${t("sellerNote")}: ${product?.return_remarks
                        }`}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="bottomBorder w-full"></div>
              <div className=" flex justify-between">
                <p className="font-bold">{t("price")}:</p>
                <p className="font-bold">
                  {setting?.currency}
                  {(product?.discounted_price !== 0
                    ? product?.discounted_price
                    : product?.price
                  )?.toFixed(
                    setting?.decimal_point ? setting?.decimal_point : 0,
                  )}
                </p>
              </div>
              <div className="bottomBorder w-full"></div>
              <div className="w-full">
                {(showAction || showStatus) && (
                  <div className="flex gap-2 md:gap-3  items-center">
                    {Number(product?.active_status) === 6 &&
                      isShowProductRating &&
                      product?.return_requested === null ? (
                      userRating ? (
                        <div
                          className="flex items-center flex-col px-1 cursor-pointer  md:w-[165px] shrink-0"
                          onClick={() => handleShowUpdateRating(product)}
                        >
                          <button
                            className="px-4 py-2 hover:bg-[#6ac8931f] text-[#141A1F] bg-[#DB93051F] rounded-md flex gap-1 w-full items-center font-medium  text-sm justify-center"
                            onClick={() => handleShowUpdateRating(product)}
                          >
                            {t("edit_review")} | {userRating?.rate}
                            <IoMdStar size={20} fill="#DB9305" />
                          </button>
                        </div>
                      ) : (
                        <div className="">
                          <button
                            className="px-4 py-2 hover:bg-[#6ac8931f] text-[#55AE7B] bg-[#55AE7B1F] rounded-md flex gap-1 items-center font-medium text-base justify-center"
                            onClick={() => handleShowRating(product)}
                          >
                            <MdOutlineStar size={20} />
                            {t("rate")}
                          </button>
                        </div>
                      )
                    ) : (
                      <></>
                    )}

                    <div className="w-full flex justify-start">
                      {Number(product?.active_status) <= 6 &&
                        Number(product?.active_status) <=
                        Number(product?.till_status) &&
                        Number(product?.cancelable_status) === 1 && (
                          <div className="w-full md:w-[151px]">
                            <button
                              className="px-4 py-2 text-red-500 bg-[#DB3D261F] rounded-md hover:bg-red-200 w-full font-medium"
                              onClick={() => handleCancel(product)}
                            >
                              {t("cancel")}
                            </button>
                          </div>
                        )}

                      {Number(product?.active_status) === 6 &&
                        Number(product?.return_status) === 1 &&
                        product?.return_requested === null && (
                          <button
                            className="text-[#DB3D26] underline "
                            onClick={() => handleReturn(product)}
                          >
                            {t("return")}
                          </button>
                        )}

                      {Number(product?.active_status) === 7 &&
                        Number(product?.cancelable_status) === 0 && (
                        <div className="flex flex-col gap-1 w-full md:w-full">
                          <button
                            className="px-4 py-2 text-red-500 bg-[#DB3D261F] md:w-[151px] rounded-md "
                            disabled
                          >
                            {t("cancelled")}
                          </button>
                          {product?.cancellation_reason && (
                            <p className="text-sm text-red-500 ">
                              <span className="font-bold text-red-500">{`${t("cancel_reason")}: `}</span>{`${product.cancellation_reason}`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <CancelReasonModal
        showCancelMoodal={showCancelMoodal}
        setShowCancelModal={setShowCancelModal}
        selectedProduct={selectedProduct}
        handleFetchOrderDetail={handleFetchOrderDetail}
      />
      <ReturnReasonModal
        showReturnModal={showReturnModal}
        setShowReturnModal={setShowReturnModal}
        selectedProduct={selectedProduct}
        handleFetchOrderDetail={handleFetchOrderDetail}
      />
      <ProductRatingModal
        showRating={showRating}
        setShowRating={setShowRating}
        selectedProduct={selectedProduct}
        handleFetchOrderDetail={handleFetchOrderDetail}
      />
      <RatingUpdateModal
        ratingId={ratingId}
        showUpdateRating={showUpdateRating}
        setShowUpdateRating={setShowUpdateRating}
        handleFetchOrderDetail={handleFetchOrderDetail}
      />
    </div>
  );
};

export default OrderItems;
