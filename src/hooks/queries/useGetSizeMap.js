import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../lib/constants";
import { fetchSizeMap } from "../../api/size";

export function useGetSizeMap(target, category) {
  return useQuery({
    queryFn: () => fetchSizeMap(target, category),
    queryKey: QUERY_KEYS.size.list(target, category),
    enabled: !!target && !!category,
  });
}
