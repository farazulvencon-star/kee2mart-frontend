import React, { useState, useEffect } from "react";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { t } from "@/utils/translation";
import { useRouter } from "next/router";
import * as api from "@/api/apiRoutes";
import { formatCustomDate } from "@/lib/utils";
import Loader from "../loader/Loader";
import BreadCrumb from "../breadcrumb/BreadCrumb";
import RecentBlogsSwiper from "./RecentBlogsSwiper";

import { PiMediumLogoFill } from "react-icons/pi";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinShareButton,
  LinkedinIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import { usePathname } from "next/navigation";

const BlogDetail = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { slug } = router.query;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);

  useEffect(() => {
    if (!slug) return;
    handleFetchBlog();
  }, [slug]);

  const handleFetchBlog = async () => {
    setLoading(true);
    try {
      const blog = await api.getBlogs({ slug: slug });
      setBlog(blog?.data?.[0]);
      handleSetBlogCount(blog?.data?.[0]);
      handleFetchBlogs(blog?.data?.[0]?.id);
      setTags(blog?.data?.[0]?.tag_names);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error", error);
    }
  };

  const handleFetchBlogs = async (blogId) => {
    try {
      const blogs = await api.getBlogs({
        offset: 0,
        limit: 10,
      });
      const filteredBlogs = blogs?.data?.filter((blog) => blog.id !== blogId);
      setRecentBlogs(filteredBlogs);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSetBlogCount = async (blogData) => {
    try {
      const views = await api.setBlogCount({ blogId: blogData?.id });
    } catch (error) {
      console.log("error", error);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <BreadCrumb title={blog?.translations?.title}/>
      <div className="">
        <div className="backgroundColor border-t-2">
          <div className="container flex flex-col gap-6 py-10">
            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-2xl">{blog?.translations?.title}</h1>
              <p className="font-medium !text-start blog-description">
                {blog?.translations?.short_description}
              </p>
            </div>
            <div className="w-full">
              <ImageWithPlaceholder
                className={" w-full aspect-video rounded-md  "}
                src={blog?.image_url}
                alt={blog?.title}
                height={600}
                width={1000}
              />
            </div>
            <div className="p-3 flex flex-col md:flex-row  gap-2 md:gap-10 bodyBackgroundColor rounded-lg">
              <div className="flex flex-col ">
                <p className="subTextColor">{t("categories")}</p>
                <h4 className="font-bold">{blog?.category?.translations?.name}</h4>
              </div>
              <div className="border h-12 hidden md:block"></div>
              <div className="flex flex-col ">
                <p className="subTextColor">{t("published_date")}</p>
                <h4 className="font-bold">
                  {blog?.created_at}
                </h4>
              </div>
              <div className="border h-12 hidden md:block"></div>
              <div className="flex flex-col ">
                <p className="subTextColor">{t("read_time")}</p>
                <h4 className="font-bold">{`${blog?.read_time}`}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="my-12">
          <div
            className="container  !text-start px-2 md:px-0 api-html-content"
            dangerouslySetInnerHTML={{ __html: blog?.translations?.description }}
          ></div>
          {tags.length > 0 && (
            <div className="container">
              <div className="border my-10"></div>
              <div className="w-full backgroundColor  border  p-4 rounded-xl flex  items-start md:items-center justify-between flex-col md:flex-row ">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{t("tags")}:</span>

                  {tags?.map((tag) => (
                    <span
                      key={tag}
                      className=" bodyBackgroundColor  text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <span className="font-semibold ">{t("share")}:</span>

                  <div className="p-2 rounded-full bodyBackgroundColor">
                    <FacebookShareButton
                      url={`${process.env.NEXT_PUBLIC_BASE_URL}${decodeURI(
                        pathname
                      )}`}
                      className="w-8 h-8 rounded-full bg-gray-800  flex items-center justify-center text-white"
                    >
                      <FacebookIcon className="h-8 w-8 rounded-full  "
                        bgStyle={{ fill: "#374151" }}
                        iconFillColor="#ffffff"
                      />
                    </FacebookShareButton>
                  </div>

                  <div className="p-2 rounded-full bodyBackgroundColor">
                    <LinkedinShareButton
                      url={`${process.env.NEXT_PUBLIC_BASE_URL}${decodeURI(
                        pathname
                      )}`}
                      className="w-8 h-8 rounded-full bg-gray-800  flex items-center justify-center text-white"
                    >
                      <LinkedinIcon className="h-8 w-8 rounded-full  "
                        bgStyle={{ fill: "#374151" }}
                        iconFillColor="#ffffff"
                      />
                    </LinkedinShareButton>
                  </div>
                  <div className="p-2 rounded-full bodyBackgroundColor">
                    <WhatsappShareButton
                      url={`${process.env.NEXT_PUBLIC_BASE_URL}${decodeURI(
                        pathname
                      )}`}
                      className="w-8 h-8 rounded-full bg-gray-800  flex items-center justify-center text-white"
                    >
                      <WhatsappIcon className="h-8 w-8 rounded-full  "
                        bgStyle={{ fill: "#374151" }}
                        iconFillColor="#ffffff"
                      />
                    </WhatsappShareButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <RecentBlogsSwiper recentBlogs={recentBlogs} />
    </>
  );
};

export default BlogDetail;
