import React, { useEffect, useState } from "react";
import BreadCrumb from "../breadcrumb/BreadCrumb";
import * as api from "@/api/apiRoutes";
import CategoryCard from "./CategoryCard";
import { useLocalizedRouter } from "@/utils/localizedNav";
import { useRedirectHomeOnModuleChange } from "@/utils/useRedirectHomeOnModuleChange";
import { useDispatch, useSelector } from "react-redux";
import {
  setFilterCategory,
  setSelectedCategories,
  setFilterSort,
  setFilterView,
} from "@/redux/slices/productFilterSlice";
import CardSkeleton from "../skeleton/CardSkeleton";
import { t } from "@/utils/translation";
import Filter from "../productFilter/ProductFilter";
import FilterDrawer from "../productFilter/FilterDrawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import { FaThList } from "react-icons/fa";
import ListViewProductCard from "../productcards/ListViewProductCard";
import VerticleProductCard from "../productcards/VerticleProductCard";
import { IoFilter } from "react-icons/io5";
import NoOrderSvg from "@/assets/not_found_images/No_Orders.svg";
import Image from "next/image";
import SubCategorySwiper from "./SubCategorySwiper";
import { isRtl } from "@/lib/utils";

const CategoryDetail = () => {
  const dispatch = useDispatch();
  const router = useLocalizedRouter();
  const { slug } = router.query;

  const city = useSelector((state) => state.City);
  const filter = useSelector((state) => state.ProductFilter);
  const language = useSelector((state) => state.Language.selectedLanguage);
  const categoryBreadcrumb = useSelector(
    (state) => state.ProductFilter.categoryBreadcrumb
  );
  const rtl = isRtl();

  // A category can't exist in another module — on user module switch, go home.
  useRedirectHomeOnModuleChange();

  // ─── Category state ────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCategories, setTotalCategories] = useState(0);
  const [page, setPage] = useState(1);
  const categoryPerPage = 12;
  // const slug_id = slug === "all" ? "" : slug;

  // ─── Products state (same as ProductsList) ─────────────────────────────────
  const [productResult, setProductResult] = useState([]);
  const [offset, setOffset] = useState(0);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [values, setValues] = useState([]);
  const [isiser, setisLoader] = useState(false);
  const [totalProducts, settotalProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [fetchedCategoryName, setFetchedCategoryName] = useState(null);

  // const search = filter?.search;
  const total_products_per_page = 12;

  const hasActiveFilter =
    filter?.brand_ids?.length > 0 ||
    !!filter?.price_filter ||
    !!filter?.section_id ||
    !!filter?.seller_id ||
    !!filter?.country_id ||
    filter?.search_sizes?.some((s) => s.checked);
  const placeholderItems = Array.from({ length: 12 }).map((_, index) => index);

  const slugArray = Array.isArray(slug) ? slug : [slug];
  const isAll = slugArray[0] === "all";
  const slug_id = isAll ? "" : slugArray[slugArray.length - 1];

  // Breadcrumb title: prefer the real category name straight from the API
  // (fetchedCategoryName) so names with characters a slug can't carry (e.g.
  // "Health & Wellness") show correctly. Falls back to categoryBreadcrumb,
  // then to a humanized slug, so direct links still read nicely
  // ("packaged-foods" -> "Packaged Foods") instead of the raw slug.
  const currentSlug = slugArray[slugArray.length - 1];
  const formattedSlug = currentSlug
    ? String(currentSlug)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";
  const categoryName = categoryBreadcrumb?.find(
    (c) => c.slug === currentSlug
  )?.name;
  const breadcrumbTitle = isAll
    ? t("all")
    : fetchedCategoryName || categoryName || formattedSlug;

  // ─── Fetch the current category's own name for the breadcrumb/heading ───────
  // (avoids showing the humanized slug for names with characters a slug can't
  // carry, e.g. "Health & Wellness" -> "health-organic-wellness")
  useEffect(() => {
    setFetchedCategoryName(null);
    if (isAll || !currentSlug) return;
    let cancelled = false;
    api
      .getCategories({ slug: currentSlug, is_own_data: 1 })
      .then((res) => {
        if (cancelled) return;
        const data = res?.data;
        const matchedCategory = Array.isArray(data)
          ? data.find((c) => c.slug === currentSlug)
          : data;
        const name = matchedCategory?.translations?.name || matchedCategory?.name;
        if (name) setFetchedCategoryName(name);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentSlug, isAll, language?.id]);

  // ─── Reset category page when slug changes ─────────────────────────────────
  useEffect(() => {
    setPage(1);
  }, [slug_id]);

  useEffect(() => {
    const offset = (page - 1) * categoryPerPage;
    fetchCategories(slug_id, offset);
  }, [page, slug_id]);

  // ─── Fetch products whenever filter changes (same as ProductsList) ──────────
  useEffect(() => {
    setOffset(0);
    filterProductsFromApi(
      {
        min_price: filter.price_filter?.min_price,
        max_price: filter.price_filter?.max_price,
        brand_ids: filter?.brand_ids.toString(),
        sort: filter?.sort_filter,
        // search: search,
        limit: total_products_per_page,
        sizes: filter?.search_sizes
          ?.filter((obj) => obj.checked)
          .map((obj) => obj["size"])
          .join(","),
        offset: 0,
        unit_ids: filter?.search_sizes
          ?.filter((obj) => obj.checked)
          .map((obj) => obj["unit_id"])
          .join(","),
        seller_id: filter?.seller_id,
        country_id: filter?.country_id,
        section_id: filter?.section_id,
      },
      0,
      slug_id
    );
  }, [
    // search,
    slug_id,
    filter.brand_ids,
    filter.sort_filter,
    filter?.search_sizes,
    filter?.price_filter,
    filter?.seller_id,
    filter?.country_id,
    filter?.section_id,
    city?.city,
  ]);


  // ─── Category fetch ────────────────────────────────────────────────────────
  const fetchCategories = async (Slug = "", offset = 0) => {
    setIsLoading(true);
    try {
      const result = await api.getCategories({
        limit: categoryPerPage,
        offset,
        slug: Slug,
      });
      setCategories(result);
      setTotalCategories(result?.total || 0);
    } catch (error) {
      console.log("Error", error);
    }
    setIsLoading(false);
  };

  // ─── Category click ────────────────────────────────────────────────────────
  const handleCategoryClick = (category) => {
    dispatch(setSelectedCategories({ data: category?.slug }));
    dispatch(setFilterCategory({ data: category?.slug }));

    const baseSlugPath = slugArray[0] === "all" ? [] : slugArray;
    const newPath = [...baseSlugPath, category.slug];

    router.push(`/categories/${newPath.join("/")}`);
  };

  // ─── Products fetch (same as ProductsList) ─────────────────────────────────
  const filterProductsFromApi = async (filterParams, targetOffset, categorySlug) => {
    try {
      if (targetOffset === 0) {
        setLoading(true);
      } else {
        setIsLoadMoreLoading(true);
      }
      const result = await api.getProductByFilter({
        latitude: city.city.latitude,
        longitude: city.city.longitude,
        filters: { ...filterParams, category_slug: categorySlug },
      });
      if (result.status === 1) {
        handlePrices(result);
        if (
          (categorySlug ||
            filterParams.brand_ids ||
            filterParams.price_filter?.min_price ||
            filterParams.price_filter?.max_price) &&
          targetOffset == 0
        ) {
          setProductResult(result.data);
        } else {
          if (targetOffset === 0) {
            setProductResult(result.data);
          } else {
            setProductResult((prevProduct) => [
              ...prevProduct,
              ...result.data,
            ]);
          }
        }
        settotalProducts(result.total);
      } else {
        setProductResult([]);
        settotalProducts(0);
      }
    } catch (error) {
      const regex = /Failed to fetch/g;
      if (regex.test(error.message)) {
        console.log("Network Error");
      }
      console.log(error.message);
    } finally {
      setLoading(false);
      setIsLoadMoreLoading(false);
    }
  };

  const handlePrices = async (result) => {
    if (minPrice == null && maxPrice == null && filter?.price_filter == null) {
      setMinPrice(parseInt(result.total_min_price));
      if (result.total_min_price === result.total_max_price) {
        setMaxPrice(parseInt(result.total_max_price) + 100);
        setValues([
          parseInt(result.total_min_price),
          parseInt(result.total_max_price) + 100,
        ]);
      } else {
        setMaxPrice(parseInt(result.total_max_price));
        setValues([
          parseInt(result.total_min_price),
          parseInt(result.total_max_price),
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
    const nextOffset = offset + total_products_per_page;
    setOffset(nextOffset);
    filterProductsFromApi(
      {
        min_price: filter.price_filter?.min_price,
        max_price: filter.price_filter?.max_price,
        brand_ids: filter?.brand_ids.toString(),
        sort: filter?.sort_filter,
        // search: search,
        limit: total_products_per_page,
        sizes: filter?.search_sizes
          ?.filter((obj) => obj.checked)
          .map((obj) => obj["size"])
          .join(","),
        offset: nextOffset,
        unit_ids: filter?.search_sizes
          ?.filter((obj) => obj.checked)
          .map((obj) => obj["unit_id"])
          .join(","),
        seller_id: filter?.seller_id,
        country_id: filter?.country_id,
        section_id: filter?.section_id,
      },
      nextOffset,
      slug_id
    );
  };

  const sortProduct = async (value) => {
    setProductResult([]);
    setOffset(0);
    dispatch(setFilterSort({ data: value }));
  };

  const totalPages = Math.ceil(totalCategories / categoryPerPage);

  return (
    <section>
      <BreadCrumb title={breadcrumbTitle} />
      <div className="container">

        {/* ── Product List (same as ProductsList) ───────────────────────── */}
        <div className="px-2">
          {/* Mobile filter trigger */}
          <div
            className="w-full cardBorder md:hidden flex p-3 mt-4 rounded-sm gap-2 items-center text-xl font-bold hover:cursor-pointer"
            onClick={() => setShowFilter(true)}
          >
            <IoFilter />
            {t("filter")}
          </div>

          <div className="my-8 grid grid-cols-12 gap-6">
            {/* Sidebar filter (desktop) */}
            <div className="col-span-3 rounded-sm hidden md:block">
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
                setisLoader={setisLoader}
                hideCategory={true}
                disableFilter={false}
              />
            </div>

            {/* Product area */}
            <div className="col-span-12 md:col-span-9">
              <div className="flex flex-col gap-6">
                {/* Subcategory swiper — aligned with the products */}
                {categories?.data?.length > 0 && (
                  <SubCategorySwiper
                    subCategories={categories?.data ?? []}
                    isLoading={isLoading}
                    languageType={language?.type}
                    rtl={rtl}
                    onCategoryClick={handleCategoryClick}
                  />
                )}
                
                {/* Sort / view toggle header */}
                {loading ? (
                  <CardSkeleton height={70} />
                ) : (
                  <div className="flex justify-between flex-col md:flex-row md:items-center p-4 cardBorder rounded-md gap-1 md:gap-0 headerBackgroundColor">
                    <p className="text-dm font-normal order-2 md:order-1">
                      {totalProducts} {t("products_found")}
                    </p>
                    <div className="flex justify-between gap-3 order-1 md:order-2">
                      <div className="flex gap-2 items-center">
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
                          <SelectContent className="w-[120px] md:w-[150px] lg:w-[200px] h-full z-10 hidden md:block lg:block">
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
                      <div className="flex gap-4 items-center">
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
                            ? "primaryBackColor rounded-md text-white p-1.5"
                            : ""
                            } hover:cursor-pointer`}
                        >
                          <FaThList size={23} onClick={handleListViewChange} />
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product cards */}
                <div className="grid grid-cols-12 gap-2 h-full">
                  {loading ? (
                    placeholderItems.map((index) => {
                      return filter?.grid_view ? (
                        <div
                          className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3"
                          key={index}
                        >
                          <CardSkeleton height={300} />
                        </div>
                      ) : (
                        <div className="col-span-12 lg:col-span-6" key={index}>
                          <CardSkeleton height={200} />
                        </div>
                      );
                    })
                  ) : productResult?.length <= 0 ? (
                    <div className="flex flex-col justify-center items-center col-span-12">
                      <div className="h-3/4 w-3/4">
                        <Image
                          src={NoOrderSvg}
                          alt="Product not found"
                          width={512}
                          height={508}
                          className="h-full w-full"
                        />
                      </div>
                      <h2 className="font-bold text-2xl max-w-md text-center">
                        {t("no_product_found")}
                      </h2>
                    </div>
                  ) : (
                    productResult?.map((product) => {
                      return filter?.grid_view ? (
                        <div
                          className="col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-3"
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

                  {/* Load more skeleton */}
                  {isLoadMoreLoading
                    ? placeholderItems.map((index) => {
                      return filter?.grid_view ? (
                        <div
                          className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3"
                          key={index}
                        >
                          <CardSkeleton height={300} />
                        </div>
                      ) : (
                        <div className="col-span-12" key={index}>
                          <CardSkeleton height={200} />
                        </div>
                      );
                    })
                    : <></>}

                  {/* Load more button */}
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

      {/* Mobile filter drawer */}
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
        hideCategory={true}
        disableFilter={false}
      />
    </section>
  );
};

export default CategoryDetail;
