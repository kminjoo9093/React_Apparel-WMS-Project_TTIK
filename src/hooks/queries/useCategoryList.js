import { useQuery } from "@tanstack/react-query";
import { fetchCategoryList } from "../../api/category";
import { QUERY_KEYS } from "../../lib/constants";

export function useCategoryList(){
  return useQuery({
    queryFn: fetchCategoryList,
    queryKey: QUERY_KEYS.category.list,
  })
}