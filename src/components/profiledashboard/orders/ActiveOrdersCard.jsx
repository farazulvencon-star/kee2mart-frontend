import React, { useState } from "react";
import { t } from "@/utils/translation";
import Image from "next/image";
import DemoImage from "/public/demo.png";
import { IoIosArrowRoundForward } from "react-icons/io";
import { formatCustomDate } from "@/lib/utils";
import { useSelector } from "react-redux";
import { LocalizedLink } from "@/utils/localizedNav";
import LiveTrackingModal from "./LiveTrackingModal";
import ReoderConfirmModal from "./ReoderConfirmModal";
import ImageWithPlaceholder from "@/components/image-with-placeholder/ImageWithPlaceholder";

const ActiveOrdersCard = ({ order }) => {
  const [showReoderModal, setShowReorderModal] = useState(false);
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const setting = useSelector((state) => state.Setting);

  const getOrderStatus = () => {
    switch (order?.active_status) {
      case "1":
        return (
          <span className="w-[150px] text-sm p-2 text-center md:w-10/12 paymentPendingStatus rounded-sm md:text-base font-bold ">
            {t("paymentPending")}
          </span>
        );
      case "2":
        return (
          <span className="w-[150px] text-sm p-2 text-center md:w-10/12 orderRecieved rounded-sm md:text-base font-bold">
            {t("order_status_display_name_recieved")}
          </span>
        );
      case "3":
        return (
          <span className=" w-[150px] text-sm p-2 text-center md:w-10/12 orderProcessed rounded-sm md:text-base font-bold">
            {t("processed")}
          </span>
        );
      case "4":
        return (
          <span className="w-[150px] text-sm p-2 text-center md:w-10/12 rounded-sm orderShipped md:text-base font-bold">
            {t("order_status_display_name_shipped")}
          </span>
        );
      case "5":
        return (
          <span className="w-[150px] text-sm p-2 text-center md:w-10/12 orderOutForDelivery rounded-sm md:text-base font-bold">
            {t("out_for_delivery")}
          </span>
        );
      case "6":
        return (
          <span className="w-[150px] text-sm p-2 text-center md:w-10/12 orderDelivered rounded-sm md:text-base font-bold">
            {t("order_status_display_name_delivered")}
          </span>
        );
      case "7":
        return (
          <span className="w-[150px] text-sm p-2 text-center md:w-10/12 rounded-sm orderCancelled md:text-base font-bold">
            {t("cancelled")}
          </span>
        );
      case "8":
        return (
          <span className="w-[150px] text-sm p-2 text-center md:w-10/12 orderReturned rounded-sm md:text-base font-bold">
            {t("returned")}
          </span>
        );
      case "9":
        return (
          <span className="w-[150px] text-sm p-2 text-center md:w-10/12 orderInProcess rounded-sm md:text-base font-bold">
            {t("order_in_process")}
          </span>
        );
      case "10":
        return (
          <span className="w-[150px] text-sm p-2 text-center md:w-10/12 orderReadyToPickup rounded-sm md:text-base font-bold">
            {t("ready_to_pickup")}
          </span>
        );
      case "9":
        return (
          <span className="w-[150px] text-sm p-2 text-center md:w-10/12 orderPicked rounded-sm md:text-base font-bold">
            {t("picked")}
          </span>
        );
      default:
        return (
          <span className="w-[150px] text-sm p-2 text-center md:w-10/12 orderReturned rounded-sm md:text-base font-bold">
            {t("returned")}
          </span>
        );
    }
  };

  const orderFirstItem = order?.items[0];

  const handleShowLiveTracking = () => {
    setShowLiveTracking(true);
  };

  const handleReoder = () => {
    setShowReorderModal(true);
  };

  return (
    <div className="w-full   ">
      <div className="py-3 px-4">
        <div className="w-full cardBorder rounded-md">
          <div className="flex flex-col gap-3 lg:gap-0 md:grid grid-cols-12 p-4 border-b-2">
            <div className="lg:col-span-8 md:col-span-6 flex flex-col lg:flex-row gap-2 lg:gap-6">
              <div className="col-span-2">
                <p className="font-normal text-sm SecondaryTextColor">
                  {t("order")}
                </p>
                <p className="font-bold text-sm">{order?.id}</p>
              </div>
              <div className="col-span-3">
                <p className="font-normal text-sm SecondaryTextColor">
                  {t("order_type")}
                </p>
                <p className="font-bold text-sm">
                  {" "}
                  {order?.order_type == "doorstep"
                    ? t("home_delivery")
                    : t("store_pickup")}
                </p>
              </div>
              <div className="col-span-3 lg:col-span-4">
                <p className="font-normal text-sm SecondaryTextColor">
                  {t("orderDate")}
                </p>
                <p className="font-bold text-sm">
                  {order?.date}
                </p>
              </div>
            </div>

            <div className="col-span-6 lg:col-span-4 flex flex-col items-start md:items-end">
              <p className="font-normal text-sm SecondaryTextColor">
                {t("orderStatus")}
              </p>
              {getOrderStatus()}
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between gap-2 md:gap-0 mb-4 w-full">
              <div className="flex  gap-2 w-full">
                <div
                  className={`relative aspect-square shrink-0 ${
                    orderFirstItem?.image_url
                      ? "h-[64px] w-[64px]"
                      : "h-[44px] w-[44px]"
                  }`}
                >
                  {orderFirstItem?.image_url && (
                    <ImageWithPlaceholder
                      src={orderFirstItem?.image_url}
                      alt="demo image"
                      fill
                      className="h-full w-full rounded-sm cardBorder p-[4px]"
                    />
                  )}
                </div>
                <div className="flex flex-col md:flex-row justify-between md:justify-center md:items-center w-full">
                  <div className="flex-grow">
                    <p className="font-bold text-base text-ellipsis overflow-hidden xl:w-[600px] line-clamp-2 ">
                      {orderFirstItem?.name}
                    </p>
                    <p className="text-sm font-normal">
                      {orderFirstItem?.variant_name}
                    </p>
                  </div>

                  <div className="md:ml-auto md:mt-0">
                    {orderFirstItem?.discounted_price != 0 ? (
                      <div className="flex md:flex-col gap-1">
                        <p className="text-base font-bold">
                          {setting?.setting?.currency}
                          {orderFirstItem?.discounted_price}
                        </p>
                        <p className="text-base font-normal line-through SecondaryTextColor">
                          {setting?.setting?.currency}
                          {orderFirstItem?.price}
                        </p>
                      </div>
                    ) : (
                      <p className="text-base font-bold">
                        {setting?.setting?.currency}
                        {orderFirstItem?.price}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {order?.items?.length > 1 && (
              <button className="rounded-full py-2 px-3 bg-[#12141814] font-medium text-base">
                +{order?.items?.length - 1} {t("moteItems")}
              </button>
            )}
          </div>
          <div className="backgroundColor topBorder rounded-sm">
            <div
              className={`md:grid md:grid-cols-12 lg:flex justify-between p-4  md:flex-row gap-1 md:gap-0`}
            >
              <div className="flex col-span-4 md:flex-col gap-1">
                <span className="SecondaryTextColor">
                  {t("total")} {t("Credit")}{" "}
                </span>
                <span className="font-bold text-lg">
                  {" "}
                  {setting?.setting?.currency}
                  {order?.final_total}
                </span>
              </div>
              <div className="grid grid-cols-12 lg:flex col-span-8 items-center gap-2 flex-wrap">
                <LocalizedLink
                  href={`/order-detail/${order?.id}`}
                  className="py-2 px-3 cardBorder hover:primaryBackColor hover:text-white rounded-sm col-span-7"
                >
                  {t("view_details")}
                </LocalizedLink>

                <button
                  className="cardBorder py-2 px-3 rounded-sm font-medium text-base hover:primaryBackColor hover:text-white col-span-5"
                  onClick={handleReoder}
                >
                  {t("reorder")}
                </button>
                {order?.active_status == "5" ? (
                  <button
                    className="py-2 px-3 primaryBackColor text-white rounded-sm flex justify-center  items-center gap-1 text-base font-medium col-span-12"
                    onClick={handleShowLiveTracking}
                  >
                    {t("track_order")}{" "}
                    <IoIosArrowRoundForward size={20} className="p-0 m-0" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <LiveTrackingModal
        showLiveTracking={showLiveTracking}
        setShowLiveTracking={setShowLiveTracking}
        order={order}
      />
      <ReoderConfirmModal
        showReoderModal={showReoderModal}
        setShowReorderModal={setShowReorderModal}
        order={order}
      />
    </div>
  );
};

export default ActiveOrdersCard;
