import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import * as api from "@/api/apiRoutes";
import { t } from "@/utils/translation";
import { formatCustomDate } from "@/lib/utils";
import OrderAdressCard from "./OrderAdressCard";
import { useSelector } from "react-redux";
import OrderItems from "./OrderItems";
import OrderPrescriptions from "./OrderPrescriptions";
import OrderStepper from "./OrderStatusStepper";
import FinalCheckoutSummary from "./FinalCheckoutSummary";
import BreadCrumb from "../breadcrumb/BreadCrumb";
import { MdOutlineFileDownload, MdOutlineWatchLater } from "react-icons/md";
import Loader from "../loader/Loader";
import { FiPhoneCall } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";

const OrderDetail = () => {
  const router = useRouter();
  const { orderid } = router.query;
  const address = useSelector((state) => state.Addresses);
  const [orderDetail, setOrderDetail] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderid) {
      handleFetchOrderDetail();
    }
  }, [orderid]);

  const handleFetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await api.getOrders({ orderId: orderid });
      if (response?.status == 1) {
        setOrderDetail(response.data[0]);
        setLoading(false);
      } else {
        console.log("Error", response);
        setLoading(false);
      }
    } catch (error) {
      console.log("Error", error);
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.downloadInvoice({ orderId: orderid });
      var fileURL = window.URL.createObjectURL(new Blob([response.data]));
      var fileLink = document.createElement("a");
      fileLink.href = fileURL;
      fileLink.setAttribute("download", "Invoice-No:" + orderid + ".pdf");
      document.body.appendChild(fileLink);
      fileLink.click();
    } catch (error) {
      if (error.request.statusText) {
        toast.error(error.request.statusText);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(t("something_went_wrong"));
      }
    }
  };

  const handleLocationRedirect = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  return (
    <section>
      <BreadCrumb />
      <div className="container my-12 px-2">
        {loading ? (
          <>
            <Loader />
          </>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between backgroundColor p-4 rounded-md">
              <div className="flex items-center gap-2">
                <div>
                  <span className="font-normal text-base">
                    {t("orderNumber")}:
                  </span>
                  <h1 className="text-2xl font-bold">#{orderDetail?.id}</h1>
                </div>
                <div className="md:border-l-2">
                  <div className="md:ml-2 flex flex-col">
                    <span className="font-normal text-sm ">
                      {t("order_type")}:
                    </span>
                    <p className="text-base font-bold">
                      {orderDetail?.order_type == "doorstep"
                        ? t("home_delivery")
                        : t("store_pickup")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start md:flex-row md:items-center">
                <div className="flex flex-col items-start md:items-end">
                  <span className="font-normal text-sm ">{t("orderDate")}</span>
                  <p className="text-base font-medium">
                    {orderDetail?.date}
                  </p>
                </div>
                {Number(
                  orderDetail?.active_status < 6 &&
                  parseInt(orderDetail?.otp) !== 0 &&
                  orderDetail.order_type == "doorstep" &&
                  orderDetail?.otp !== null
                ) ? (
                  <div className="flex flex-col items-start md:items-end">
                    <span className="font-normal text-sm ">{t("otp")}</span>
                    <p className="text-base font-medium">{orderDetail?.otp}</p>
                  </div>
                ) : (
                  <></>
                )}

                {/* {Number(orderDetail?.active_status) === 6 ? ( */}
                <div className="md:border-l-2">
                  <button
                    className="flex items-center gap-2 bg-[#29363F] p-2 md:ml-2 rounded-md text-white"
                    onClick={handleDownloadInvoice}
                  >
                    <MdOutlineFileDownload size={22} /> {t("GetInvoice")}
                  </button>
                </div>
                {/* ) : null} */}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 px-2 md:px-0 md:gap-8">
              {orderDetail?.order_note !== "" && (
                <div className="col-span-12 flex flex-col gap-3 mb-8 md:mb-2">
                  <h3 className="font-bold text-2xl">
                    {t("order_note_title")}
                  </h3>
                  <div className="cardBorder p-4 rounded-sm text-base font-normal">
                    <p>{orderDetail?.order_note}</p>
                  </div>
                </div>
              )}

              <div className="col-span-12 md:col-span-8 flex flex-col gap-8">
                {orderDetail?.order_type == "doorstep" ? (
                  <div className="flex flex-col gap-3">
                    <h1 className="font-bold text-2xl">
                      {t("shippingAdress")}
                    </h1>
                    <div className="cardBorder rounded-sm">
                      <OrderAdressCard orderDetail={orderDetail} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <h1 className="font-bold text-2xl">
                      {t("pickup_from_store")}
                    </h1>
                    <div className="flex flex-col h-full p-4   cardBorder rounded-sm gap-6">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <IoLocationOutline size={22} />
                          <div className="flex flex-col gap-1">
                            <h2 className="font-bold text-base">
                              {orderDetail?.pickup_address?.seller_name}
                            </h2>
                            <p className="font-medium">
                              {
                                orderDetail?.pickup_address
                                  ?.pickup_store_address
                              }
                            </p>
                          </div>
                        </div>
                        <div>
                          <button
                            className="px-4 py-2 flex item-center footer text-white rounded-md gap-1"
                            onClick={() => {
                              handleLocationRedirect(
                                orderDetail?.pickup_address?.pickup_latitude,
                                orderDetail?.pickup_address?.pickup_longitude
                              );
                            }}
                          >
                            <IoLocationOutline size={22} />
                            {t("direction")}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex gap-2 items-center">
                          <FiPhoneCall size={20} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h2 className="font-bold text-base">{t("phone")}</h2>
                          <p className="font-medium">
                            {orderDetail?.pickup_address?.seller_mobile}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex gap-2 items-center">
                          <MdOutlineWatchLater size={20} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h2 className="font-bold text-base">
                            {t("open_hours")}
                          </h2>
                          <p className="font-medium">
                            {`${t("today")} ${orderDetail?.pickup_address?.opening_time
                              } - ${orderDetail?.pickup_address?.closing_time}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <h1 className="font-bold text-2xl">{t("items")}</h1>
                  <OrderItems
                    products={orderDetail?.items}
                    handleFetchOrderDetail={handleFetchOrderDetail}
                    isShowProductRating={orderDetail?.product_rating == true}
                  />
                </div>

                <OrderPrescriptions orderDetail={orderDetail} />
              </div>

              <div className="col-span-12 md:col-span-4 flex flex-col gap-6 mt-4 md:mt-0">
                {orderDetail?.status?.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h1 className="font-bold text-2xl">{t("track_order")}</h1>
                    <OrderStepper orderDetail={orderDetail} />
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <h1 className="font-bold text-2xl">{t("billing_details")}</h1>
                  <FinalCheckoutSummary orderDetail={orderDetail} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default OrderDetail;
