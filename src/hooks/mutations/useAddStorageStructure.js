import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addStorageStructure } from "../../api/storage/fetchStorageData";
import { QUERY_KEYS } from "../../lib/constants";

export function useAddStorageStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storageAddReq) => addStorageStructure(storageAddReq),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.storage.all,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rack.all,
      });
    },
  });
}
