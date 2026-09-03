import React from "react";
import dynamic from "next/dynamic";
import MetaData from "@/components/metadata-component/MetaData";
const RequestProducts = dynamic(
  () => import("@/components/pagecomponents/RequestedProductPage"),
  {
    ssr: false,
  }
);

const index = () => {
  return (
    <div>
      <MetaData
        pageName="/profile/requested-products"
        title={`Requested Products - ${process.env.NEXT_PUBLIC_META_TITLE}`}
      />
      <RequestProducts />
    </div>
  );
};

export default index;
