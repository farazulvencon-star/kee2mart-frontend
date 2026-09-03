import React from "react";
import { useMediaQuery } from "react-responsive";
import { useEffect } from "react";
import CategoryCard from "./CategoryCard";
import { t } from "@/utils/translation";
import { LocalizedLink } from "@/utils/localizedNav";
import { useLocalizedRouter } from "@/utils/localizedNav";
import { useDispatch, useSelector } from "react-redux";
import { setFilterCategory } from "@/redux/slices/productFilterSlice";
import {
  setListingSource,
  setCategorySlug,
  setCategoryBreadcrumb,
} from "@/redux/slices/productFilterSlice";
import { resolveCardBg } from "@/lib/utils";

const CategoriesContainer = ({ categories }) => {
  const dispatch = useDispatch();
  const router = useLocalizedRouter();
  const selectedCategories = useSelector(
    (state) => state.ProductFilter?.selectedCategories,
  );
  const language = useSelector((state) => state.Language.selectedLanguage);
  const theme = useSelector((state) => state.Theme.theme);
  const isDark = theme === "dark";
  const bgMode = categories?.category_background_color_mode;
  const bgGlobalLight = categories?.category_background_color_light_theme;
  const bgGlobalDark = categories?.category_background_color_dark_theme;
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

  // Show only 2 rows at every breakpoint (columns: base 4 / sm 4 / md 6 / lg 8)
  const isMd = useMediaQuery({ minWidth: 768 });
  const isLg = useMediaQuery({ minWidth: 1024 });
  const columns = isLg ? 8 : isMd ? 6 : 4;
  const visibleCategories = categories?.categories?.slice(0, columns * 2);

  return (
    <section>
      <div className="container feature-section" dir={language?.type}>
        <div className="flex justify-between items-center w-full mb-3">
          <h2 className="textColor text-2xl font-bold m-0">
            {t("shop_by")} {t("categories")}
          </h2>
          <LocalizedLink
            className="text-nowrap SecondaryTextColor hover:primaryColor text-base font-medium"
            href="/categories/all"
          >
            {t("see_all")}
          </LocalizedLink>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mt-6">
          {visibleCategories?.map((category, index) => (
            <div key={index} onClick={() => handleCategoryClick(category)}>
              <CategoryCard
                category={category}
                bgColor={resolveCardBg({
                  mode: bgMode,
                  item: category,
                  globalLight: bgGlobalLight,
                  globalDark: bgGlobalDark,
                  isDark,
                })}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesContainer;
