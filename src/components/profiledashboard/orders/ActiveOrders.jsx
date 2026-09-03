import React, { useState, useEffect } from "react";
import { t } from "@/utils/translation";
import ActiveOrdersCard from "./ActiveOrdersCard";
import * as api from "@/api/apiRoutes";
import CardSkeleton from "@/components/skeleton/CardSkeleton";
import OrderNotFoundImage from "@/assets/not_found_images/No_Orders.svg";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaCaretDown } from "react-icons/fa";
import { useSelector } from "react-redux";

const ActiveOrders = () => {
  const activeModuleId = useSelector((state) => state.Module.activeModuleId);
  const [loading, setLoading] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [offset, setOffset] = useState(0);
  const [totalOrders, setTotalOrders] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [orderType, setOrderType] = useState("");

  useEffect(() => {
    handleFetchActiveOrders(false, 0);
  }, [orderType, activeModuleId]);

  const ordersPerPage = 10;

  const handleFetchActiveOrders = async (isLoadMore = false, newOffset) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await api.getOrders({
        limit: ordersPerPage,
        offset: newOffset,
        type: 1,
        orderType,
      });
      if (response.status == 1) {
        if (isLoadMore) {
          setActiveOrders((ord) => [...ord, ...response.data]);
        } else {
          setActiveOrders(response.data);
        }
        setTotalOrders(response.total);
        setLoading(false);
        setLoadingMore(false);
      } else {
        setActiveOrders([]);
        setLoading(false);
        setTotalOrders(0);
        setLoadingMore(false);
      }
    } catch (error) {
      console.log("Error", error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFetchMore = async () => {
    setLoadingMore(true);
    const newOffset = offset + ordersPerPage;
    setOffset(newOffset);
    handleFetchActiveOrders(true, newOffset);
  };

  return (
    <div className="w-full cardBorder rounded-sm ">
      <div className="backgroundColor flex justify-between p-4 items-center">
        <h2 className="font-bold text-xl">{t("active_orders")}</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full rounded cardBorder border text-base textColor py-2 px-4 flex items-center gap-2 group justify-between">
              <div className="font-medium">
                {orderType
                  ? orderType == "doorstep"
                    ? t("home_delivery")
                    : t("store_pickup")
                  : t("select_order_type")}
              </div>
              <div>
                <FaCaretDown className="transition-transform duration-300 ease-in-out group-data-[state=open]:-rotate-180" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" transition-all duration-300 ease-in-out">
              <DropdownMenuItem
                key={1}
                onSelect={() => setOrderType("")}
                className="text-base textColor"
              >
                {t("default")}
              </DropdownMenuItem>
              <DropdownMenuItem
                key={1}
                onSelect={() => setOrderType("doorstep")}
                className="text-base textColor"
              >
                {t("home_delivery")}
              </DropdownMenuItem>
              <DropdownMenuItem
                key={2}
                onSelect={() => setOrderType("selfpickup")}
                className="text-base textColor"
              >
                {t("store_pickup")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div>
        {loading ? (
          Array?.from({ length: 6 })?.map((_, index) => {
            return <CardSkeleton height={200} padding="p-4" key={index} />;
          })
        ) : activeOrders.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center flex-col gap-2 p-3">
            <Image
              src={OrderNotFoundImage}
              alt="Order Not found"
              width={298}
              height={298}
              unoptimized
              className="h-1/2 w-1/2"
            />
            <h2 className="text-2xl font-bold">{t("no_order")}</h2>
          </div>
        ) : (
          activeOrders?.map((order) => {
            return <ActiveOrdersCard order={order} key={order?.id} />;
          })
        )}
        {loadingMore ? (
          Array?.from({ length: 6 })?.map((_, index) => {
            return <CardSkeleton height={200} padding="p-4" key={index} />;
          })
        ) : (
          <></>
        )}
      </div>
      {totalOrders > activeOrders?.length && (
        <div className="flex justify-center p-4">
          <button
            className="bg-[#29363f] py-2 px-4 text-white rounded-sm text-lg font-normal"
            onClick={handleFetchMore}
          >
            {t("load_more")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveOrders;
