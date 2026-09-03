import React from "react";
import { t } from "@/utils/translation";

const BlogsCategories = ({
  blogsCategories,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <div className="flex flex-col p-4 gap-6 border rounded-lg backgroundColor">
      <h2 className="font-bold  text-xl underline">{t("categories")}</h2>
      <div className="flex flex-col gap-6">
        {blogsCategories?.map((category, i) => {
          return (
            <div
              key={category?.id}
              onClick={() => setSelectedCategory(category?.id)}
              className={`flex justify-between p-4 items-center  rounded-lg font-bold text-base ${selectedCategory == category?.id
                ? "primaryBackColor text-white"
                : "headerBackgroundColor textColor"
                }  cursor-pointer`}
            >
              <div className="flex items-center gap-2 ">
                <p>{i + 1}</p>
                <p>{category?.translations?.name}</p>
              </div>
              <div>
                <p>{`(${category?.active_blogs_count})`}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogsCategories;
