import { useQuery } from "@tanstack/react-query";
import { getZonesByStorage } from "../../api/storage/fetchStorageData";
import { QUERY_KEYS } from "../../lib/constants";

export function useZonesByStorage(storageSn) {
  return useQuery({
    queryFn: () => getZonesByStorage(storageSn),
    queryKey: QUERY_KEYS.storage.zones(storageSn),
    enabled: !!storageSn,
  });
}
