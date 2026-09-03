import MetaData from "@/components/metadata-component/MetaData";
const FAQsPage = dynamic(() => import("@/components/pagecomponents/FAQsPage"), {
  ssr: false,
});
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

    let metatitle = defaultProps.title;
    let metaDescription = defaultProps.description;
    let metaKeywords = defaultProps.keywords;
    let ogImage = defaultProps.ogImage;
    let schemaMarkup = null;
    let favicon = defaultProps.favicon;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_SUBURL}/settings/get_seo_settings`,
        {
          params: {
            page_type: "Faqs",
          },
          headers: {
            "Content-Language": lang,
          }
        },
      );

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
          structuredData: schemaMarkup,
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


const index = ({ title, description, keywords, schemaMarkup, ogImage, favicon }) => {
  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/faqs`;

  return (
    <div>
      <MetaData
        pageName="/faqs"
        title={title}
        description={description}
        keywords={keywords}
        structuredData={schemaMarkup}
        ogImage={ogImage}
        ogUrl={pageUrl}
        favicon={favicon}
      />
      <FAQsPage />
    </div>
  );
};

export default index;
