import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../lib/constants";
import { getRacksByZone } from "../../api/storage/fetchStorageData";

export function useRacksByZone(zoneSn) {
  return useQuery({
    queryFn: () => getRacksByZone(zoneSn),
    queryKey: QUERY_KEYS.storage.racks(zoneSn),
    enabled: !!zoneSn,
  });
}
