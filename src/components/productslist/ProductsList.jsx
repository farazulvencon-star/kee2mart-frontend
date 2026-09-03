import React, { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import BreadCrumb from "../breadcrumb/BreadCrumb";
import { t } from "@/utils/translation";
import Filter from "../productFilter/ProductFilter";
import * as api from "@/api/apiRoutes";
import { useDispatch, useSelector } from "react-redux";
import { setFilterCategory } from "@/redux/slices/productFilterSlice";
import { useQuery } from "@tanstack/react-query";

import {
  setListingSource,
  setCategorySlug,
  setCategoryBreadcrumb,
} from "@/redux/slices/productFilterSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalizedRouter } from "@/utils/localizedNav";
import { useRedirectHomeOnModuleChange } from "@/utils/useRedirectHomeOnModuleChange";
import "swiper/css";
import "swiper/css/navigation";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import { FaThList } from "react-icons/fa";
import ListViewProductCard from "../productcards/ListViewProductCard";
import VerticleProductCard from "../productcards/VerticleProductCard";
import CardSkeleton from "../skeleton/CardSkeleton";
import FilterDrawer from "../productFilter/FilterDrawer";
import { IoFilter } from "react-icons/io5";
import {
  setFilterSort,
  setFilterView,
} from "@/redux/slices/productFilterSlice";
import NoOrderSvg from "@/assets/not_found_images/No_Orders.svg";
import Image from "next/image";

const findCategoryPath = (categories, targetId) => {
  if (!categories || !Array.isArray(categories)) return null;

  for (const category of categories) {
    if (category.id == targetId) {
      return [category];
    }
    if (category.cat_active_childs && category.cat_active_childs.length > 0) {
      const path = findCategoryPath(category.cat_active_childs, targetId);
      if (path) {
        return [category, ...path];
      }
    }
  }
  return null;
};

const Products = () => {
  const dispatch = useDispatch();
  const router = useLocalizedRouter();
  const city = useSelector((state) => state.City);
  // const [subCategories, setSubCategories] = useState([]);
  // const [isSubCatLoading, setIsSubCatLoading] = useState(false);
  const filter = useSelector((state) => state.ProductFilter);
  const activeModuleId = useSelector((state) => state.Module.activeModuleId);

  // A user module switch invalidates this module's product list → go home.
  useRedirectHomeOnModuleChange();

  const total_products_per_page = filter?.grid_view ? 24 : 14;
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [values, setValues] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(filter?.search);
  const { selectedLanguage } = useSelector((state) => state.Language);
  const language = useSelector((state) => state.Language.selectedLanguage);
  const categoryBreadcrumb = useSelector(
    (state) => state.ProductFilter.categoryBreadcrumb,
  );

  const ancestorCategoryIds = (categoryBreadcrumb) => {
    if (!Array.isArray(categoryBreadcrumb) || categoryBreadcrumb.length === 0) {
      return null;
    }
    return categoryBreadcrumb.map((category) => category.id).join(",");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filter?.search);
    }, 500);
    return () => clearTimeout(timer);
  }, [filter?.search]);

  

  useEffect(() => {
    if (!categoryBreadcrumb || categoryBreadcrumb.length === 0) return;
    // const needsTranslation = categoryBreadcrumb.some(cat => !cat.translations);
    
    refetchBreadcrumbTranslations();
  }, [selectedLanguage, categoryBreadcrumb.length > 0]);

  const refetchBreadcrumbTranslations = async () => {
    const updated = await Promise.all(
      categoryBreadcrumb.map(async (category) => {
        try {
          const res = await api.getCategories({
            slug: category.slug,
            is_own_data: 1,
          });
          const data = res?.data;

          // Find the matched category from the response array to avoid taking the first one if the API returns a list
          const matchedCategory = Array.isArray(data)
            ? data.find((c) => c.slug === category.slug || c.id === category.id)
            : data;

          if (!matchedCategory) return category;

          return {
            ...category,
            name: matchedCategory?.translations?.name || matchedCategory?.name || category.name,
            translations: matchedCategory?.translations || category.translations,
          };
        } catch (error) {
          return category;
        }
      }),
    );

    // Only dispatch if there's an actual change to avoid infinite loops
    const isDifferent = JSON.stringify(updated) !== JSON.stringify(categoryBreadcrumb);
    if (isDifferent) {
    dispatch(setCategoryBreadcrumb({ data: updated }));
    }
  };

  const resolvedCategory =
    filter?.category_id === "NaN" || filter?.category_id === "all categories"
      ? null
      : filter?.category_id;

  const finalCategoryIds = resolvedCategory;

  const fetchProducts = async ({ pageParam = 0 }) => {
    const filterParams = {
      min_price: filter.price_filter?.min_price,
      max_price: filter.price_filter?.max_price,
      ...(finalCategoryIds && {
        category_ids: finalCategoryIds,
      }),
      brand_ids: filter?.brand_ids.toString(),
      sort: filter?.sort_filter,
      search: debouncedSearch,
      limit: total_products_per_page,
      sizes: filter?.search_sizes
        ?.filter((obj) => obj.checked)
        .map((obj) => obj["size"])
        .join(","),
      offset: pageParam,
      unit_ids: filter?.search_sizes
        ?.filter((obj) => obj.checked)
        .map((obj) => obj["unit_id"])
        .join(","),
      seller_id: filter?.seller_id,
      country_id: filter?.country_id,
      section_id: filter?.section_id,
    };

    return await api.getProductByFilter({
      latitude: city.city.latitude,
      longitude: city.city.longitude,
      filters: filterParams,
    });
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    
  } = useInfiniteQuery({
    queryKey: [
      "products",
      { ...filter, search: debouncedSearch },
      city?.city?.latitude,
      city?.city?.longitude,
      language?.id,
      resolvedCategory,
      activeModuleId,
    ],
    queryFn: fetchProducts,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.data || lastPage.data.length < total_products_per_page) {
        return undefined;
      }
      return allPages.length * total_products_per_page;
    },
    initialPageParam: 0,
  });

  const productResult = data?.pages?.flatMap((page) => page?.data ?? []) ?? [];
  const totalProducts = data?.pages?.[0]?.total || 0;
  const loading = isLoading;
  const isLoadMoreLoading = isFetchingNextPage;
  
  const setProductResult = () => { };
  const setOffset = () => { };

  useEffect(() => {
    if (data?.pages?.[0]) {
      handlePrices(data.pages[0]);
    }
  }, [data]);

  const handlePrices = async (result) => {
    if (
      filter?.price_filter?.min_price !== undefined &&
      filter?.price_filter?.min_price !== null &&
      filter?.price_filter?.max_price !== null &&
      filter?.price_filter?.max_price !== undefined
    ) {
      setValues([
        parseInt(filter?.price_filter?.min_price),
        parseInt(filter?.price_filter?.max_price),
      ]);
      setMinPrice(parseInt(result?.total_min_price));
      setMaxPrice(parseInt(result?.total_max_price));
    } else {
      setMinPrice(parseInt(result?.total_min_price));
      if (result.total_min_price === result.total_max_price) {
        setMaxPrice(parseInt(result?.total_max_price) + 100);
        setValues([
          parseInt(result?.total_min_price),
          parseInt(result?.total_max_price) + 100,
        ]);
      } else {
        setMaxPrice(parseInt(result?.total_max_price));
        setValues([
          parseInt(result?.total_min_price),
          parseInt(result?.total_max_price),
        ]);
      }
    }
  };

  const handleGridViewChange = () => {
    dispatch(setFilterView({ data: true }));
  };
  const handleListViewChange = () => {
    dispatch(setFilterView({ data: false }));
  };

  const handleFetchMore = async () => {
    fetchNextPage();
  };

  const sortProduct = async (value) => {
    dispatch(setFilterSort({ data: value }));
  };

  const placeholderItems = Array.from({ length: 12 }).map((_, index) => index);

  // Legacy category URLs (/products?source=category&category=<slug>) now live at
  // /categories/<slug>. Redirect so old shared/bookmarked links keep working.
  useEffect(() => {
    if (!router.isReady) return;
    const { source, category: slug_from_url } = router.query;
    if (source === "category" && slug_from_url) {
      router.replace(`/categories/${slug_from_url}`);
    }
  }, [router.isReady, router.query]);

  
  return (
    <section>
      <div>
        <div>
          <BreadCrumb />
        </div>
        <div className="container px-2">
          <div className="md:hidden sticky pt-0.5 top-0 z-30 bodyBackgroundColor">
            <div
              className="w-full cardBorder flex p-3 mt-3.5 rounded-sm gap-2 items-center text-xl font-bold hover:cursor-pointer"
              onClick={() => setShowFilter(true)}
            >
              <IoFilter />
              {t("filter")}
            </div>
          </div>
          <div className="mb-5  md:my-8 grid grid-cols-12 gap-6">
            <div className=" col-span-3 rounded-sm hidden md:block ">
              <Filter
                setProductResult={setProductResult}
                setOffset={setOffset}
                handlePrices={handlePrices}
                minPrice={minPrice}
                maxPrice={maxPrice}
                values={values}
                setValues={setValues}
                setMaxPrice={setMaxPrice}
                setMinPrice={setMinPrice}
                hideCategory={false}
                disableFilter={false}
              />
            </div>
            <div className="col-span-12 md:col-span-9">
              <div
                className={`mb-6 pt-5 md:py-0 sticky top-[56px] bodyBackgroundColor z-20 md:static `}
              >
                {loading ? (
                  <CardSkeleton height={70} />
                ) : (
                  <div
                    className={` flex justify-between flex-col md:flex-row  md:items-center p-4 cardBorder rounded-md gap-1 md:gap-0  headerBackgroundColor  `}
                  >
                    <p className="text-dm font-normal order-2 md:order-1">
                      {totalProducts} {t("products_found")}
                    </p>
                    <div className="flex justify-between gap-3 order-1 md:order-2 ">
                      <div className="flex  gap-2 items-center">
                        <p className="text-sm text-nowrap font-normal">
                          {t("sortBy")}
                        </p>
                        <Select
                          onValueChange={sortProduct}
                          value={filter?.sort_filter}
                        >
                          <SelectTrigger className="w-[120px] md:w-[150px] lg:w-[200px] h-full buttonBackground border-none">
                            <SelectValue placeholder={t("default")} />
                          </SelectTrigger>
                          <SelectContent className="w-[120px] md:w-[150px] lg:w-[200px] h-full z-30  hidden md:block lg:block">
                            <SelectItem value="default">
                              {t("default")}
                            </SelectItem>
                            <SelectItem value="new">
                              {t("newest_first")}
                            </SelectItem>
                            <SelectItem value="old">
                              {t("oldest_first")}
                            </SelectItem>
                            <SelectItem value="high">
                              {t("high_to_low")}
                            </SelectItem>
                            <SelectItem value="low">
                              {t("low_to_high")}
                            </SelectItem>
                            <SelectItem value="discount">
                              {t("discount_high_to_low")}
                            </SelectItem>
                            <SelectItem value="popular">
                              {t("popularity")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex  gap-4 items-center">
                        <span
                          className={`${filter?.grid_view
                            ? "primaryBackColor rounded-md text-white p-1.5"
                            : ""
                            } hover:cursor-pointer`}
                        >
                          <BsFillGrid3X3GapFill
                            size={23}
                            onClick={handleGridViewChange}
                          />
                        </span>
                        <span
                          className={`${!filter?.grid_view
                            ? "primaryBackColor rounded-md text-white  p-1.5"
                            : ""
                            } hover:cursor-pointer`}
                        >
                          <FaThList size={23} onClick={handleListViewChange} />
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-12 xl:grid-cols-12 gap-2 xl:gap-4 h-full">
                  {loading ? (
                    placeholderItems.map((index) => {
                      return filter?.grid_view ? (
                        <div
                          className="col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-2"
                          key={index}
                        >
                          <CardSkeleton variant="grid" />
                        </div>
                      ) : (
                        <div className="col-span-12 lg:col-span-6">
                          <CardSkeleton variant="list" />
                        </div>
                      );
                    })
                  ) : productResult?.length <= 0 ? (
                    <div className="flex flex-col justify-center items-center col-span-12">
                      <div className="h-3/4 w-3/4">
                        <Image
                          src={NoOrderSvg}
                          alt="Product not found"
                          width={320}
                          height={320}
                          className="h-full w-full"
                        />
                      </div>
                      <h2 className="font-bold text-2xl">
                        {t("no_product_found")}
                      </h2>
                    </div>
                  ) : (
                    productResult?.map((product) => {
                      return filter?.grid_view ? (
                        <div
                          className=" col-span-4 md:col-span-3 lg:col-span-3 xl:col-span-2 "
                          key={product?.id}
                        >
                          <VerticleProductCard product={product} />
                        </div>
                      ) : (
                        <div className="col-span-12 lg:col-span-6" key={product?.id}>
                          <ListViewProductCard product={product} />
                        </div>
                      );
                    })
                  )}

                  {isLoadMoreLoading ? (
                    placeholderItems.map((index) => {
                      return filter?.grid_view ? (
                        <div
                          className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3"
                          key={index}
                        >
                          <CardSkeleton variant="grid" />
                        </div>
                      ) : (
                        <div className="col-span-12">
                          <CardSkeleton variant="list" />
                        </div>
                      );
                    })
                  ) : (
                    <></>
                  )}
                  <div className="col-span-12 mt-6 w-full flex justify-center mx-auto">
                    {totalProducts > productResult?.length ? (
                      <button
                        className="bg-[#29363f] rounded-md text-white text-base font-medium gap-1 p-1.5 px-3"
                        onClick={handleFetchMore}
                      >
                        {t("load_more")}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FilterDrawer
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        setProductResult={setProductResult}
        setOffset={setOffset}
        handlePrices={handlePrices}
        minPrice={minPrice}
        maxPrice={maxPrice}
        values={values}
        setValues={setValues}
        setMaxPrice={setMaxPrice}
        setMinPrice={setMinPrice}
      />
    </section>
  );
};

export default Products;
