import MetaData from "@/components/metadata-component/MetaData";
const PrivacyPolicyPage = dynamic(
  import("@/components/pagecomponents/PrivacyPolicyPage"),
  { ssr: false },
);
import { extractJSONFromMarkup } from "@/utils/helperFunction";
import axios from "axios";
import dynamic from "next/dynamic";
import React from "react";

let serverSidePropsFunction = null;
if (process.env.NEXT_PUBLIC_SEO == "true") {
  serverSidePropsFunction = async (context) => {
    const lang = context.query.lang;
    const defaultProps = {
      title: process.env.NEXT_PUBLIC_META_TITLE,
      description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
      keywords: process.env.NEXT_PUBLIC_META_KEYWORDS,
      schemaMarkup: null,
      ogImage: "",
      favicon: null,
    };
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_SUBURL}/settings/get_seo_settings`,
        {
          params: {
            page_type: "Privacy policy",
          },
          headers: {
            "Content-Language": lang,
          }
        },
      );
      let metatitle = defaultProps.title;
      let metaDescription = defaultProps.description;
      let metaKeywords = defaultProps.keywords;
      let ogImage = defaultProps.ogImage;
      let favicon = defaultProps.favicon;
      let schemaMarkup = null;
      if (
        process.env.NEXT_PUBLIC_SEO == "true" &&
        response.data.data?.length > 0
      ) {
        const seoData = response.data.data;
        metatitle = seoData[0].translations.meta_title || defaultProps.title;
        metaDescription = seoData[0].translations.meta_description || defaultProps.description;
        metaKeywords = seoData[0].translations.meta_keyword || defaultProps.keywords;
        ogImage = seoData[0].og_image_url || defaultProps.ogImage;
        favicon = seoData[0].favicon || defaultProps.favicon;
        if (seoData[0].translations.schema_markup) {
          schemaMarkup = extractJSONFromMarkup(seoData[0]?.translations?.schema_markup) || defaultProps.schemaMarkup;
        }
      }
      return {
        props: {
          title: metatitle,
          description: metaDescription,
          keywords: metaKeywords,
          schemaMarkup: schemaMarkup ? JSON.stringify(schemaMarkup) : null,
          ogImage: ogImage,
          favicon: favicon ? favicon : null,
        },
      };
    } catch (error) {
      console.log("error", error);
      return { props: defaultProps };
    }
  }
}

export const getServerSideProps = serverSidePropsFunction



const index = ({ title, description, keywords, ogImage, schemaMarkup, favicon }) => {
  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy`;
  return (
    <div>
      <MetaData
        pageName="/privacy-policy"
        title={title}
        description={description}
        keywords={keywords}
        ogImage={ogImage}
        ogUrl={pageUrl}
        structuredData={schemaMarkup}
        favicon={favicon}
      />
      <PrivacyPolicyPage />
    </div>
  );
};

export default index;
