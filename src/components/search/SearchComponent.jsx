"use client";
import React, { useEffect, useState } from "react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/utils/translation";
import { setFilterCategory } from "@/redux/slices/productFilterSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLocalizedRouter } from "@/utils/localizedNav";
import SearchProductCard from "../cards/SearchProductCard";
import { FaSearch } from "react-icons/fa";
import { isRtl } from "@/lib/utils";
import * as api from "@/api/apiRoutes";

const SearchComponent = ({
  handleSearchCategory,
  handleSearch,
  isSuggLoading,
}) => {
  const rtl = isRtl();
  const dispatch = useDispatch();
  const router = useLocalizedRouter();
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const filter = useSelector((state) => state.ProductFilter);

  useEffect(() => {
    if(showCategories){
      fetchCategories();
    }
    setShowCategories(false);
  }, [showCategories]);

  const fetchCategories = async () => {
    try {
      setIsCategoryLoading(true);
      const categories = await api.getCategories();
      setCategories(categories.data);
    } catch (error) {
      console.log("erorr", error);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleSearchItemClick = async () => {
    dispatch(setFilterCategory({ data: filter?.searchedCategory }));
    router.push("/products");
  };

  return (
    <>
      <div
        className={`flex w-full  h-full flex-col py-2 items-center md:flex-row md:ml-[10px]  md:p-0`}
        onClick={() => setShowCategories(true)}
      >
        {/* All categories dropdown removed from UI */}
        {/* <Select
          dir={rtl ? "rtl" : "ltr"}
          value={filter?.searchedCategory}
          onValueChange={(value) => handleSearchCategory(value)}
        >
          <SelectTrigger
            className={`w-full h-full buttonBackground cardBorder  focus:ring-0 rounded-t-sm rounded-b-none md:rounded-l-sm md:rounded-r-none md:w-[152px] md:border-none md:min-w-[152px]`}
          >
            <SelectValue placeholder={t("all_categories")} />
          </SelectTrigger>

          <SelectContent className="w-full h-full z-50 md:w-[152px]">
            <SelectItem value="all categories">
              {t("all_categories")}

            </SelectItem>
            {isCategoryLoading ? (
                <div className="p-2 w-full">
                  <Skeleton height={25} count={5} className="mb-2" />
                </div>
              ) : (
                categories?.map((category) => (
                  <SelectItem key={category?.id} value={`${category?.id}`}>
                    {category?.translations?.name}
                  </SelectItem>
                ))
              )}

          </SelectContent>
        </Select> */}
        <div className="w-full flex flex-col flex-grow md:relative md:flex-row md:h-ful rounded-lg cardBorder">
          {/* New search bar design: rounded-lg input w/ left search icon, no button */}
          <div className="self-stretch w-full h-12 px-4 py-2 headerBackgroundColor rounded-lg  inline-flex justify-start items-center gap-3 order-1">
            <FaSearch className="size-5 subTextColor" />
            <input
              type="text"
              placeholder={t("iAmLookingFor")}
              className="w-full flex-grow bg-transparent textColor placeholder:subTextColor text-base font-medium leading-6 focus:outline-none"
              value={filter?.search ? filter?.search : ""}
              onChange={(e) => handleSearch(e)}
            />
          </div>
          {/* Search button removed from UI */}
          {/* <button
            className={`justify-center gap-1 px-4 py-2 h-full flex items-center rounded-br-md rounded-bl-md
            font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 bg-[#29363f] text-white text-xl shadow
            md:p-[20px] order-2
            ${rtl ? "md:rounded-bl-md md:rounded-l-md md:rounded-br-none" : "md:rounded-bl-none md:rounded-r-md"}
            `}
            onClick={() => {
              handleSearchItemClick();
            }}
          >
            <FaSearch />
            {t("search")}
          </button> */}
          <div
            className="md:w-[calc(100%-126px)] mt-1 flex flex-wrap flex-col col-span-4  bodyBackgroundColor gap-1 order-2 md:order-2 md:absolute 
                      md:z-10 md:bodyBackgroundColor md:top-12 md:left-0 shadow-[0_0_16px_gray]
                    "
          >
            {(router?.pathname !== "/products" && filter?.search) &&
              filter?.search_product?.map((product, idx) => (
                <SearchProductCard key={idx} product={product} />
              ))}
            {router?.pathname !== "/products" &&
              !isSuggLoading &&
              filter?.search &&
              filter?.search_product?.length === 0 && (
                <div className="ps-2 py-2 text-bold text-xl font-medium text-center md:text-start">
                  {t("no_product_found")}
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchComponent;
