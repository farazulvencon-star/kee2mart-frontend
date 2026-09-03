import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  setFilterCategory,
  clearAllFilter,
  setFilterBrands,
  setFilterMinMaxPrice,
  setFilterBySeller,
} from "@/redux/slices/productFilterSlice";
import * as api from "@/api/apiRoutes";
import { t } from "@/utils/translation";
import { buildPriceRanges } from "@/lib/utils";
import CategoryTree from "./CategoryTree";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FaChevronDown } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";
// import { resetSelectedCategories } from "@/redux/slices/productFilterSlice";
import FilterSkeleton from "./FilterSkeleton";

const Filter = ({
  setProductResult,
  setOffset,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  setShowFilter = () => {},
  hideCategory,
  disableFilter,
}) => {
  const filter = useSelector((state) => state.ProductFilter);
  const setting = useSelector((state) => state?.Setting?.setting);
  const city = useSelector((state) => state.City);
  const language = useSelector((state) => state.Language.selectedLanguage);
  const activeModuleId = useSelector((state) => state.Module.activeModuleId);
  const dispatch = useDispatch();
  const [categories, setCategories] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [brands, setbrands] = useState(null);
  const [sellers, setSellers] = useState(null);
  const [totalBrands, setTotalBrands] = useState();
  const [totalSeller, setTotalSeller] = useState();
  const [brandOffset, setBrandOffset] = useState(0);
  const [sellerOffset, setSellerOffset] = useState(0);
  const [tempMinPrice, setTempMinPrice] = useState(null);
  const [tempMaxPrice, setTempMaxPrice] = useState(null);
  const [defaultMinPrice, setDefaultMinPrice] = useState(minPrice);
  const [defaultMaxPrice, setDefaultMaxPrice] = useState(maxPrice);
  const [activeKey, setActiveKey] = useState(["1", "2", "3", "4"]);
  const priceRanges = useMemo(
    () => buildPriceRanges(minPrice, maxPrice),
    [minPrice, maxPrice],
  );
  const brandLimit = 10;
  const sellerLimit = 10;
  // const [loading, setLoading] = useState(false);
  // const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingSellers, setLoadingSellers] = useState(false);
  useEffect(() => {
    if (!language?.id) return;
    setbrands(null);
    setSellers(null);
    setBrandOffset(0);
    setSellerOffset(0);
    fetchBrands(0);
    fetchSellers(0);
  }, [language?.id, activeModuleId]);

  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["filter-category", language?.id, activeModuleId],

    queryFn: async () => {
      const response = await api.getCategories();
      return response.data;
    },

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  const handleActiveKey = (key) => {
    setActiveKey((prevActiveKeys) =>
      prevActiveKeys.includes(key)
        ? prevActiveKeys.filter((item) => item !== key)
        : [...prevActiveKeys, key],
    );
  };

  const fetchSellers = useCallback(
    async (sOffset) => {
      setLoadingSellers(true);
      try {
        const result = await api.getSellers({
          latitude: city?.city?.latitude,
          longitude: city?.city?.longitude,
          limit: sellerLimit,
          offset: sOffset,
        });
        if (result.status === 1) {
          setSellers((prevSellers) => {
            if (prevSellers == null) {
              return result?.data;
            } else {
              return [...prevSellers, ...result?.data];
            }
          });
          setTotalSeller(result?.total);
        }
        // setSellers(result?.data);
      } catch (error) {
        console.log("Error", error);
      } finally {
        setLoadingSellers(false);
      }
    },
    [city?.city?.latitude, city?.city?.longitude,language?.id],
  );

  // const fetchCategories = async () => {
  //   setLoadingCategories(true);
  //   try {
  //     const categories = await api.getCategories();
  //     setCategories(categories.data);
  //   } catch (error) {
  //     console.log("erorr", error);
  //   } finally {
  //     setLoadingCategories(false);
  //   }
  // };

  const handleCategoryChange = (categories) => {
    setSelectedCategories(categories);
    // NOTE: Comment below line due to empty state issue in product page on refresh
    // setProductResult([]); // Reset products
    setOffset(0); // Reset offset
    dispatch(setFilterCategory({ data: categories.join(",") }));
  };

  const fetchBrands = useCallback(
    async (bOffset) => {
      setLoadingBrands(true);
      try {
        const result = await api.getBrands({
          limit: brandLimit,
          offset: bOffset,
          latitude: city?.city?.latitude,
          longitude: city?.city?.longitude,
        });
        if (result.status === 1) {
          setbrands((prevBrands) => {
            if (prevBrands == null) {
              return result?.data;
            } else {
              return [...prevBrands, ...result?.data];
            }
          });
          setTotalBrands(result?.total);
        }
      } catch (error) {
        console.log("Error", error);
      } finally {
        setLoadingBrands(false);
      }
    },
    [city?.city?.latitude, city?.city?.longitude, language?.id],
  );

  const filterbyBrands = (brand) => {
    var brand_ids = [...filter.brand_ids];
    if (brand_ids.includes(brand.id)) {
      brand_ids.splice(brand_ids.indexOf(brand.id), 1);
    } else {
      brand_ids.push(parseInt(brand.id));
    }
    const sorted_brand_ids = sort_unique_brand_ids(brand_ids);
    dispatch(setFilterBrands({ data: sorted_brand_ids }));
  };

  const sort_unique_brand_ids = (int_brand_ids) => {
    if (int_brand_ids.length === 0) return int_brand_ids;
    int_brand_ids = int_brand_ids.sort(function (a, b) {
      return a * 1 - b * 1;
    });
    var ret = [int_brand_ids[0]];
    for (var i = 1; i < int_brand_ids.length; i++) {
      //Start loop at 1: arr[0] can never be a duplicate
      if (int_brand_ids[i - 1] !== int_brand_ids[i]) {
        ret.push(int_brand_ids[i]);
      }
    }
    return ret;
  };

  const loadMoreBrands = () => {
    setBrandOffset((prevOffset) => prevOffset + brandLimit);
    fetchBrands(brandOffset + brandLimit);
  };

  const loadMoreSellers = () => {
    setSellerOffset((prevOffset) => prevOffset + sellerLimit);
    fetchSellers(sellerOffset + sellerLimit);
  };

  useEffect(() => {
    setDefaultMinPrice(minPrice);
    setDefaultMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  return (
    <>
      {loadingCategories || loadingBrands || loadingSellers ? (
        <FilterSkeleton />
      ) : (
        <div className="md:cardBorder rounded-md headerBackgroundColor ">
          <div className="p-3 md:p-4 bottomBorder ">
            <div className="flex justify-between items-center  ">
              <h5 className="text-xl font-bold">{t("filters")}</h5>
              <p
                className="m-0 text-sm font-normal text-[#DB3D26] cursor-pointer"
                onClick={() => {
                  setSelectedCategories([]);
                  setMinPrice(defaultMinPrice);
                  setMaxPrice(defaultMaxPrice);
                  setTempMinPrice(null);
                  setTempMaxPrice(null);

                  if (disableFilter) {
                    dispatch(
                      clearAllFilter({
                        preserveCategory: filter.listing_source === "category",
                      }),
                    );
                  } else {
                    dispatch(clearAllFilter());
                  }
                  // dispatch(resetSelectedCategories())
                  setOffset(0);
                  setShowFilter(false);
                  setProductResult([]);
                }}
              >
                {t("clearAll")}
              </p>
            </div>
          </div>
          {!hideCategory && (
            <Collapsible
              open={activeKey.includes("1")}
              className="w-full bottomBorder"
              onOpenChange={() => handleActiveKey("1")}
            >
              <CollapsibleTrigger className="w-full p-4 flex justify-between items-center">
                <div className="text-start font-medium textColor md:text-base">
                  {t("product_category")}
                </div>
                <div
                  className={`transition-transform duration-250 ${
                    activeKey.includes("1") ? "rotate-0" : "-rotate-90"
                  }`}
                >
                  <FaChevronDown />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="filter-row">
                  <CategoryTree
                    categories={categories}
                    selectedCategories={selectedCategories}
                    onCategoryChange={handleCategoryChange}
                    initialFilter={filter}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {brands && brands?.length > 0 && (
            <Collapsible
              open={activeKey.includes("2")}
              className="w-full bottomBorder"
              onOpenChange={() => handleActiveKey("2")}
            >
              <CollapsibleTrigger className="w-full p-4 flex justify-between items-center">
                <div className="text-base font-medium textColor">
                  {t("brands")}
                </div>
                <div
                  className={`transition-transform duration-250 ${
                    activeKey.includes("2") ? "rotate-0" : "-rotate-90"
                  }`}
                >
                  <FaChevronDown />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="filter-row px-2 pb-4 md:px-2 lg:px-4">
                  {brands?.map((brand, index) => {
                    const isChecked = filter.brand_ids.includes(brand.id);
                    return (
                      <div
                        key={brand.id}
                        className="flex items-center ml-1 my-2 md:ml-1.5 lg:ml-2 gap-2"
                        onClick={() => {
                          setProductResult([]);
                          filterbyBrands(brand);
                        }}
                      >
                        <Checkbox
                          className="data-[state=checked]:primaryBackColor shadow-sm border-gray-300 border-[1.5px]"
                          checked={isChecked}
                          onCheckedChange={() => {
                            setProductResult([]);
                            filterbyBrands(brand);
                          }}
                        />
                        <span className="text-sm font-normal textColor">
                          {brand?.translations?.name ?? brand?.name}
                        </span>
                      </div>
                    );
                  })}
                  {brands?.length < totalBrands ? (
                    <a
                      className="brand-view-more textColor"
                      onClick={loadMoreBrands}
                    >
                      {t("showMore")}
                    </a>
                  ) : (
                    <></>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <Collapsible
            open={activeKey.includes("3")}
            className="w-full bottomBorder"
            onOpenChange={() => handleActiveKey("3")}
          >
            <CollapsibleTrigger className="w-full p-4 flex justify-between items-center">
              <div className="text-base font-medium textColor">
                {t("sellers")}
              </div>
              <div
                className={`transition-transform duration-250 ${
                  activeKey.includes("3") ? "rotate-0" : "-rotate-90"
                }`}
              >
                <FaChevronDown />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pb-4 md:px-2 lg:px-4">
              <div className="filter-row ">
                {sellers?.map((seller) => {
                  const isChecked = filter.seller_id === seller.id; // single selected seller
                  return (
                    <div
                      key={seller.id}
                      className="flex items-center ml-1 my-2 md:ml-1.5 lg:ml-2 gap-2"
                      onClick={() => {
                        setProductResult([]);
                        setOffset(0);
                        dispatch(
                          setFilterBySeller({
                            data: seller.id,
                          }),
                        );
                      }}
                    >
                      <input
                        type="radio"
                        name="seller" // same name for all to ensure single selection
                        className="h-4 w-4"
                        checked={isChecked}
                        onChange={() => {
                          setProductResult([]);
                          setOffset(0);
                          dispatch(
                            setFilterBySeller({
                              data: seller.id,
                            }),
                          );
                        }}
                      />
                      <span className="text-sm font-normal textColor">
                        {seller?.translations?.name ?? seller?.name}
                      </span>
                    </div>
                  );
                })}

                {sellers?.length < totalSeller ? (
                  <a
                    className="brand-view-more textColor"
                    onClick={loadMoreSellers}
                  >
                    {t("showMore")}
                  </a>
                ) : (
                  <></>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible
            open={activeKey.includes("4")}
            className="w-full bottomBorder"
            onOpenChange={() => handleActiveKey("4")}
          >
            <CollapsibleTrigger className="w-full p-4 flex justify-between items-center">
              <div className="text-base font-medium textColor">
                {t("priceRange")}
              </div>
              <div
                className={`transition-transform duration-250 ${
                  activeKey.includes("4") ? "rotate-0" : "-rotate-90"
                }`}
              >
                <FaChevronDown />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pb-4 md:px-2 lg:px-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => {
                    const isSelected =
                      tempMinPrice === range.start &&
                      tempMaxPrice === range.end;
                    return (
                      <button
                        type="button"
                        key={`${range.start}-${range.end}`}
                        onClick={() => {
                          setTempMinPrice(range.start);
                          setTempMaxPrice(range.end);
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium textColor transition-colors ${
                          isSelected
                            ? "primaryBorder addToCartColor dark:text-black"
                            : "cardBorder"
                        }`}
                      >
                        {setting?.currency}
                        {range.start} - {setting?.currency}
                        {range.end}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="rounded py-2 px-4 buttonBackground text-xl"
                  onClick={() => {
                    setOffset(0);
                    setShowFilter(false);
                    setProductResult([]);
                    dispatch(
                      setFilterMinMaxPrice({
                        data: {
                          min_price: tempMinPrice,
                          max_price: tempMaxPrice,
                        },
                      }),
                    );
                  }}
                >
                  {t("apply")}
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </>
  );
};

export default Filter;
