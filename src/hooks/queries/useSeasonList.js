import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../lib/constants";
import { fetchSeasonList } from "../../api/season";

export function useSeasonList() {
  return useQuery({
    queryFn: fetchSeasonList,
    queryKey: QUERY_KEYS.season.list,
  });
}
