import React, { useEffect, useState } from "react";
import BreadCrumb from "../breadcrumb/BreadCrumb";
import * as api from "@/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import CategoryCard from "./CategoryCard";
import { useLocalizedRouter } from "@/utils/localizedNav";
import { useRedirectHomeOnModuleChange } from "@/utils/useRedirectHomeOnModuleChange";
import { useDispatch, useSelector } from "react-redux";
import {
  setFilterCategory,
  setSelectedCategories,
  setListingSource,
  setCategorySlug,
  setCategoryBreadcrumb,
} from "@/redux/slices/productFilterSlice";
import CardSkeleton from "../skeleton/CardSkeleton";
import { t } from "@/utils/translation";
import { resolveCardBg } from "@/lib/utils";

const Category = () => {
  const dispatch = useDispatch();
  const router = useLocalizedRouter();
  // Route is a catch-all ([...slug]) → router.query.slug is an array
  const rawSlug = router.query.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[rawSlug.length - 1] : rawSlug;
  const language = useSelector((state) => state.Language.selectedLanguage);
  const activeModuleId = useSelector((state) => state.Module.activeModuleId);
  const theme = useSelector((state) => state.Theme.theme);

  // A user module switch invalidates this module's categories → go home.
  useRedirectHomeOnModuleChange();
  const isDark = theme === "dark";
  // const [categories, setCategories] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [totalCategories, setTotalCategories] = useState(0);

  const [page, setPage] = useState(1);
  const categoryPerPage = 18;
  const slug_id = slug === "all" ? "" : slug;

  // // Reset page when slug changes
  // useEffect(() => {
  //   setPage(1);
  // }, [slug_id]);

  // useEffect(() => {
  //   const offset = (page - 1) * categoryPerPage;
  //   fetchCategories(slug_id, offset);
  // }, [page, language]);

  // const fetchCategories = async ({ queryKey }) => {
  //   const [_key, page, slug_id, language] = queryKey;

  //   const offset = (page - 1) * categoryPerPage;

  //   return api.getCategories({
  //     limit: categoryPerPage,
  //     offset,
  //     slug: slug_id,
  //   });
  // };

  const {
    data: categoriesResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["categories", page, slug_id, language?.id, activeModuleId],
    queryFn: async ({ queryKey }) => {
      const [_key, page, slug_id] = queryKey;
      const offset = (page - 1) * categoryPerPage;

      return api.getCategories({
        limit: categoryPerPage,
        offset,
        slug: slug_id,
      });
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const categories = categoriesResponse;
  const totalCategories = categoriesResponse?.total || 0;

  const categoryBreadcrumb = useSelector(
    (state) => state.ProductFilter.categoryBreadcrumb,
  );

  const handleCategoryClick = (category) => {
    // Navigate to the SEO-friendly category detail page
    router.push(`/categories/${category.slug}`);
  };

  useEffect(() => {
    dispatch(setCategoryBreadcrumb({ data: [] }));
  }, [dispatch]);

  const totalPages = Math.ceil(totalCategories / categoryPerPage);

  const title = categoryBreadcrumb?.find((c) => c.slug === slug)?.name;

  return (
    <section>
      <BreadCrumb title={title} />
      <div className="container">
        <div
          className={`grid grid-cols-4 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-2 h-auto my-5 px-2`}
        >
          {isLoading
            ? Array.from({ length: categoryPerPage }).map((_, index) => (
              <div key={index} className="col-span-1">
                <CardSkeleton height={180} />
              </div>
            ))
            : categories?.data?.map((category) => (
              <div
                key={category?.id}
                className="col-span-1"
                onClick={() => handleCategoryClick(category)}
              >
                <CategoryCard
                  category={category}
                  imageSize={122}
                  bgColor={resolveCardBg({
                    item: category,
                    globalLight: categories?.category_background_color_light_theme,
                    globalDark: categories?.category_background_color_dark_theme,
                    isDark,
                  })}
                />
              </div>
            ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center my-6 gap-2 flex-wrap">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200 ${page === 1
                ? "backgroundColor text-gray-500 cursor-not-allowed"
                : "buttonBackground hover:backgroundColor textColor"
                }`}
            >
              {t("prev")}
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNumber = idx + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200 ${page === pageNumber
                    ? "primaryBackColor text-white primaryBorder"
                    : "backgroundColor textColor hover:backgroundColor"
                    }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() =>
                setPage((prev) => (prev < totalPages ? prev + 1 : prev))
              }
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200 ${page === totalPages
                ? "backgroundColor text-gray-500 cursor-not-allowed"
                : "backgroundColor hover:backgroundColor textColor"
                }`}
            >
              {t("next")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Category;
