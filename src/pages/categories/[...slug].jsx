import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import MetaData from "@/components/metadata-component/MetaData";
import axios from "axios";
import { extractJSONFromMarkup } from "@/utils/helperFunction";

// All-categories grid (existing) vs the new category-detail page
const CategoriesPages = dynamic(
  () => import("@/components/pagecomponents/CategoriesPages"),
  { ssr: false }
);
const CategoryDetailPage = dynamic(
  () => import("@/components/pagecomponents/CategoryDetailPage"),
  { ssr: false }
);

let serverSidePropsFunction = null;
if (process.env.NEXT_PUBLIC_SEO == "true") {
  serverSidePropsFunction = async (context) => {
    const { slug } = context.params; // array of path segments
    const slugArr = Array.isArray(slug) ? slug : [slug];
    const currentSlug = slugArr[slugArr.length - 1];
    const lang = context.query.lang;

    let metaTitle = process.env.NEXT_PUBLIC_META_TITLE;
    let metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION;
    let metaKeywords = process.env.NEXT_PUBLIC_META_KEYWORDS;
    let markUpSchema = "";
    let og_image = null;
    let favicon = null;

    // No SEO lookup for the "all" grid
    if (currentSlug && currentSlug !== "all") {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_SUBURL}/categories/get_seo_things`,
          {
            params: { slug: currentSlug },
            headers: { "Content-Language": lang },
          }
        );
        const seoData = response?.data?.data || {};
        metaKeywords = seoData?.translations?.meta_keywords || metaKeywords;
        metaTitle = seoData?.translations?.meta_title || metaTitle;
        metaDescription =
          seoData?.translations?.meta_description || metaDescription;
        og_image = seoData?.og_image || null;
        favicon = seoData?.favicon || null;
        if (seoData?.translations?.schema_markup) {
          markUpSchema =
            extractJSONFromMarkup(seoData?.translations?.schema_markup) || "";
        }
      } catch (error) {
        console.error("Error fetching category SEO data:", error);
      }
    }

    return {
      props: {
        slug: slugArr,
        metaKeywords,
        metaTitle,
        metaDescription,
        markUpSchema,
        og_image,
        favicon: favicon ? favicon : null,
      },
    };
  };
}

export const getServerSideProps = serverSidePropsFunction;

const Categories = ({
  slug,
  metaTitle,
  metaKeywords,
  metaDescription,
  markUpSchema,
  og_image,
  favicon,
}) => {
  const router = useRouter();
  // Prefer SSR prop; fall back to the client route (when SEO/getServerSideProps is off)
  const routeSlug = router.query.slug;
  const slugArr = Array.isArray(slug) && slug.length
    ? slug
    : Array.isArray(routeSlug)
      ? routeSlug
      : routeSlug
        ? [routeSlug]
        : [];
  const isAll = slugArr[0] === "all";
  const pathStr = slugArr.join("/");
  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${pathStr}`;

  return (
    <div>
      <MetaData
        pageName="/categories/all"
        title={metaTitle}
        keywords={metaKeywords}
        description={metaDescription}
        structuredData={markUpSchema}
        ogUrl={pageUrl}
        ogImage={og_image}
        favicon={favicon}
      />
      {isAll ? <CategoriesPages /> : <CategoryDetailPage />}
    </div>
  );
};

export default Categories;