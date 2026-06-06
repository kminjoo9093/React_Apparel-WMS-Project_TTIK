import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../lib/constants";
import { getStorageData } from "../../api/storage/fetchStorageData";

export function useStorage(){
  return useQuery({
    queryFn: getStorageData,
    queryKey: QUERY_KEYS.storage.all,
    initialData: [],
  })
}