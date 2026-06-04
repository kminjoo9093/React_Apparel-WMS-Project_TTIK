import { useQuery } from "@tanstack/react-query";
import { fetchBrandList } from "../../api/brand";
import { QUERY_KEYS } from "../../lib/constants";

export function useBrandList(){
  return useQuery({
    queryFn: fetchBrandList,
    queryKey: QUERY_KEYS.brand.list,
  })
}