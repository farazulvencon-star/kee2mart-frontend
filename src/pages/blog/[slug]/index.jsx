import React from "react";
import dynamic from "next/dynamic";
const BlogDetailPage = dynamic(
  () => import("@/components/pagecomponents/BlogDetailPage"),
  { ssr: false }
);

import MetaData from "@/components/metadata-component/MetaData";
import axios from "axios";
import { extractJSONFromMarkup } from "@/utils/helperFunction";

let serverSidePropsFunction = null;

if (process.env.NEXT_PUBLIC_SEO == "true") {
  serverSidePropsFunction = async (context) => {
    const { slug } = context.params;
    const lang = context.query.lang;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_SUBURL}/blogs`,
        {
          params: {
            slug: slug,
          },
          headers: {
            "Content-Language": lang,
          }
        }
      );

      let metaTitle = process.env.NEXT_PUBLIC_META_TITLE;
      let metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION;
      let markUpSchema = "";
      let metaKeywords = process.env.NEXT_PUBLIC_META_KEYWORDS;
      let og_image = null;
      let favicon = null;
      if (process.env.NEXT_PUBLIC_SEO === "true") {
        const seoData = response?.data.data || {};
        metaKeywords = seoData?.[0]?.translations?.meta_keywords || metaKeywords;
        metaTitle = seoData?.[0]?.translations?.meta_title || metaTitle;
        metaDescription = seoData?.[0]?.translations?.meta_description || metaDescription;
        og_image = seoData?.[0]?.image_url || null;
        favicon = seoData?.[0].favicon || null;
        if (seoData?.translations?.schema_markup) {
          markUpSchema =
            extractJSONFromMarkup(seoData?.[0]?.translations?.schema_markup) || "";
        }
      }
      return {
        props: {
          slug,
          metaKeywords,
          metaTitle,
          metaDescription,
          markUpSchema,
          og_image,
          favicon: favicon ? favicon : null,
        },
      };
    } catch (error) {
      console.error("Error fetching product data:", error);
      return {
        notFound: true,
      };
    }
  };
}

export const getServerSideProps = serverSidePropsFunction;

const index = ({
  slug,
  metaKeywords,
  metaTitle,
  metaDescription,
  markUpSchema,
  og_image,
  favicon,
}) => {
  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${slug}`;
  return (
    <div>
      <MetaData
        pageName="/blogs/all"
        title={metaTitle}
        keywords={metaKeywords}
        description={metaDescription}
        structuredData={markUpSchema}
        ogUrl={pageUrl}
        ogImage={og_image}
        favicon={favicon}
      />
      <BlogDetailPage />
    </div>
  );
};

export default index;
