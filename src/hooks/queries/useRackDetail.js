import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../lib/constants";
import { getRackDetailInfo } from "../../api/storage/fetchRackData";

export function useRackDetail(rackSn) {
  return useQuery({
    queryFn: () => getRackDetailInfo(rackSn),
    queryKey: QUERY_KEYS.rack.detail(rackSn),
    enabled: !!rackSn,
  });
}
