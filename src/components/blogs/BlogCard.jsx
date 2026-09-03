import React from "react";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { GoDotFill } from "react-icons/go";
import { BsArrowUpRightCircle } from "react-icons/bs";
import { t } from "@/utils/translation";
import { useRouter } from "next/navigation";
import { formatOnlyDate } from "@/lib/utils";

const BlogCard = ({ blog }) => {
  const router = useRouter();
  const handleViewMore = async (slug) => {
    router.push(`/blog/${slug}`);
  };

  return (
    <div className="flex flex-col p-4 gap-4 border rounded-lg h-fit bodyBackgroundColor">
      <div>
        <ImageWithPlaceholder
          className="h-[264px] w-full rounded-lg object-cover "
          src={blog?.image_url}
          alt={blog?.translations?.title}
          width={390}
          height={264}
          quality={90}
          sizes="(max-width: 640px) 100vw, 390px"
        />
      </div>
      <div className="flex gap-2 flex-col">
        <div className="flex gap-2 items-center">
          <p>{blog?.category?.translations?.name}</p>
          <GoDotFill />
          <p>{blog?.created_at}</p>
        </div>
        <div className="flex flex-col gap-2 min-h-14">
          <div>
            <h2 className="font-bold text-xl line-clamp-1">
              {blog?.translations?.title?.slice(0, 32)}
            </h2>
            <h4 className="blog-card-description">{blog?.translations?.short_description}</h4>
          </div>
        </div>
      </div>
      <div>
        <button
          className="flex gap-1 items-center p-2 border rounded-md"
          onClick={() => handleViewMore(blog?.slug)}
        >
          {t("readMore")} <BsArrowUpRightCircle />
        </button>
      </div>
    </div>
  );
};

export default BlogCard;
