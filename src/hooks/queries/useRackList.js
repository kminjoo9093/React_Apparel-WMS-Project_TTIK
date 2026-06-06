import { useQuery } from "@tanstack/react-query";
import { getRackListData } from "../../api/storage/fetchRackData";
import { QUERY_KEYS } from "../../lib/constants";

export function useRackList({ page, size, filter }){
  return useQuery({
    queryFn: () => getRackListData({ page, size, filter }),
    queryKey: QUERY_KEYS.rack.list({ page, size, filter }),
  })
}