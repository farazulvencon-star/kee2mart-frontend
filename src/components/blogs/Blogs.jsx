"use client";
import React, { useState, useEffect } from "react";
import BlogCard from "./BlogCard";
import BlogsCategories from "./BlogsCategories";
import RecentBlogs from "./RecentBlogs";
import * as api from "@/api/apiRoutes";
import BlogSkeleton, { BlogCardSkeleton } from "./BlogsSkeleton";
import { t } from "@/utils/translation";
import BreadCrumb from "../breadcrumb/BreadCrumb";
import PopularBlogTags from "./PopularBlogTags";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [blogsCategories, setBlogCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [mostViewedBlogs, setMostViewedBlogs] = useState([]);
  const [offset, setOffset] = useState(0);
  const [totalBlogs, setTotalBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const topRef = React.useRef(null);

  const BLOG_LIMIT = 10;

  useEffect(() => {
    handleFetchBlogsCategoris();
    getMostViewedBlogs();
    handleTagFetch();
  }, []);

  useEffect(() => {
    setOffset(0);
    handleFetchBlogs(false, 0);
  }, [selectedCategory, selectedTag]);

  const handleTagFetch = async () => {
    try {
      const response = await api.getTags();
      setTags(response?.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleFetchBlogs = async (isFetchMore = false, customOffset) => {
    setBlogsLoading(true);
    try {
      const blogs = await api.getBlogs({
        offset: customOffset,
        limit: BLOG_LIMIT,
        categoryId: selectedCategory,
        tag_id: selectedTag,
      });
      if (isFetchMore) {
        setBlogs((prev) => [...prev, ...blogs.data]);
        setOffset((prev) => prev + BLOG_LIMIT);
      } else {
        setBlogs(blogs?.data);
        setOffset((prev) => prev + BLOG_LIMIT);
      }
      setBlogsLoading(false);
      setTotalBlogs(blogs?.total);
    } catch (error) {
      setBlogsLoading(false);
      console.log("error", error);
    }
  };

  const handleFetchBlogsCategoris = async () => {
    setLoading(true);
    try {
      const blogsCategories = await api.getBlogsCategories(0, 10);
      setBlogCategories(blogsCategories?.data);
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };

  const getMostViewedBlogs = async () => {
    setLoading(true);
    try {
      const response = await api.getMostViewedBlogs({ limit: 5 });
      setMostViewedBlogs(response.data);
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!blogsLoading && topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [blogsLoading]);

  const blogAvailable =
  blogsCategories?.length > 0 ||
  mostViewedBlogs?.length > 0 ||
  tags?.length > 0;

  const isFiltering = selectedCategory !== null || selectedTag !== null;

  return loading ? (
    <BlogSkeleton />
  ) : (
    <>
      <div ref={topRef}></div>
      <BreadCrumb />
      <div className="container my-12">
        <div className="grid lg:grid-cols-12 gap-6 grid-cols-1">
          <div className={`${isFiltering || blogs?.length > 0  ? "lg:col-span-8" : "lg:col-span-12"} md:col-span-12 col-span-12 flex flex-col gap-6`}>
            {blogs?.length == 0 && (
              <div className="w-full flex  justify-center items-center  h-[200px]">
                <h1 className="text-2xl font-bold">{t("noBlogFound")}</h1>
              </div>
            )}
            <div className="grid lg:grid-cols-2 grid-cols-1 md:grid-cols-2 gap-6">
              {blogsLoading
                ? Array?.from({ length: 3 })?.map((_, i) => (
                    <BlogCardSkeleton key={i} />
                  ))
                : blogs?.map((blog, i) => <BlogCard key={i} blog={blog} />)}
            </div>
            {blogs?.length < totalBlogs && (
              <div className="w-full flex justify-center mt-6">
                <button
                  className="bg-[#29363f] rounded-md text-white text-base font-medium gap-1 p-1.5 px-3"
                  onClick={() => handleFetchBlogs(true, offset)}
                >
                  {t("load_more")}
                </button>
              </div>
            )}
          </div>

          {(blogAvailable && (isFiltering || blogs.length > 0)) && (
            <div className="lg:col-span-4 md:col-span-12 col-span-12 flex flex-col gap-6">
              {blogsCategories?.length > 0 && (
                <BlogsCategories
                  blogsCategories={blogsCategories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              )}
              {mostViewedBlogs?.length > 0 && (
                <RecentBlogs mostViewedBlogs={mostViewedBlogs} />
              )}
              {tags?.length > 0 && (
                <PopularBlogTags
                  tags={tags}
                  setSelectedTag={setSelectedTag}
                  selectedTag={selectedTag}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blogs;
