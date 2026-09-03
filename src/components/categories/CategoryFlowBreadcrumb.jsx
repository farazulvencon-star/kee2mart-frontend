import { useDispatch, useSelector } from "react-redux";
import { useLocalizedRouter } from "@/utils/localizedNav";
import {
  setListingSource,
  setFilterCategory,
  setCategorySlug,
  setCategoryBreadcrumb,
} from "@/redux/slices/productFilterSlice";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { isRtl } from "@/lib/utils";
import { t } from "@/utils/translation";

const CategoryFlowBreadcrumb = () => {
  const dispatch = useDispatch();
  const router = useLocalizedRouter();
  const rtl = isRtl();
  const language = useSelector((state) => state.Language.selectedLanguage);

  const categoryBreadcrumb = useSelector(
    (state) => state.ProductFilter.categoryBreadcrumb,
  );

  if (!categoryBreadcrumb || categoryBreadcrumb.length === 0) return null;

  const handleBreadcrumbClick = (cat, index) => {
    const newBreadcrumb = categoryBreadcrumb.slice(0, index + 1);

    dispatch(setListingSource({ data: "category" }));
    dispatch(setFilterCategory({ data: cat.id }));
    dispatch(setCategorySlug({ data: cat.slug }));
    dispatch(setCategoryBreadcrumb({ data: newBreadcrumb }));

    router.push({
    pathname: "/products",
    query: {
      category: cat.slug,
      category_id: cat.id,
      source: "category",
      lang: language?.code
    }
  });
  };

  return (
    <div className="flex gap-2 text-sm SecondaryTextColor mb-3 mt-3 flex-wrap">
      {categoryBreadcrumb.map((cat, index) => (
        <span key={cat.id} className="flex items-center gap-2">
          <button
            onClick={() => handleBreadcrumbClick(cat, index)}
            className="hover:text-primary font-medium"
          >
            {cat.name}
          </button>
          {index < categoryBreadcrumb.length - 1 && (
            <span>
              {rtl ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />}
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

export default CategoryFlowBreadcrumb;
