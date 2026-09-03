import React from "react";
import dynamic from "next/dynamic";
const BlogsPage = dynamic(
  () => import("@/components/pagecomponents/BlogsPage"),
  { ssr: false }
);

import MetaData from "@/components/metadata-component/MetaData";
import axios from "axios";
import { extractJSONFromMarkup } from "@/utils/helperFunction";

const fallbackProps = {
  props: {
    title: process.env.NEXT_PUBLIC_META_TITLE || null,
    description: process.env.NEXT_PUBLIC_META_DESCRIPTION || null,
    keywords: process.env.NEXT_PUBLIC_META_KEYWORDS || null,
    schemaMarkup: null,
    ogImage: null,
    favicon: null,
  },
};

let serverSidePropsFunction = null;

if (process.env.NEXT_PUBLIC_SEO == "true") {
  serverSidePropsFunction = async (context) => {
    const lang = context.query.lang;
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_SUBURL}/settings/get_seo_settings`,
        {
          params: {
            page_type: "Blog Listing Page",
          },
          headers: {
            "Content-Language": lang,
          },
        },
      );

      let metatitle = process.env.NEXT_PUBLIC_META_TITLE || null;
      let metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION || null;
      let metaKeywords = process.env.NEXT_PUBLIC_META_KEYWORDS || null;
      let ogImage = null;
      let schemaMarkup = null;
      let favicon = null;

      if (process.env.NEXT_PUBLIC_SEO == "true" && response.data.data?.length > 0) {
        const seoData = response.data.data;
        metatitle = seoData[0]?.translations?.meta_title || metatitle;
        metaDescription =
          seoData[0]?.translations?.meta_description || metaDescription;
        metaKeywords = seoData[0]?.translations?.meta_keyword || metaKeywords;
        ogImage = seoData[0]?.translations?.og_image_url || ogImage;
        favicon = seoData[0]?.translations?.favicon || favicon;
        if (seoData[0]?.translations?.schema_markup) {
          schemaMarkup =
            extractJSONFromMarkup(seoData[0]?.translations?.schema_markup) ||
            schemaMarkup;
        }
      }

      return {
        props: {
          title: metatitle,
          description: metaDescription,
          keywords: metaKeywords,
          schemaMarkup: schemaMarkup,
          ogImage: ogImage,
          favicon: favicon,
        },
      };
    } catch (error) {
      console.log("error", error);
      return fallbackProps;
    }
  };
}

export const getServerSideProps = serverSidePropsFunction;

const index = ({
  title,
  description,
  keywords,
  schemaMarkup,
  ogImage,
  favicon,
}) => {
  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/blogs`;
  return (
    <div>
      <MetaData
        title={title}
        description={description}
        keywords={keywords}
        structuredData={schemaMarkup}
        ogImage={ogImage}
        pageName="/blogs"
        ogUrl={pageUrl}
        favicon={favicon}
      />
      <BlogsPage />
    </div>
  );
};

export default index;