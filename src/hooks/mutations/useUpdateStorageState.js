import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStorageState } from "../../api/storage/fetchStorageData";
import { QUERY_KEYS } from "../../lib/constants";

export function useUpdateStorageState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storageModifyReq) => updateStorageState(storageModifyReq),
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
