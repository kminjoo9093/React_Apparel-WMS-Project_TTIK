import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStorageStructure } from "../../api/storage/fetchStorageData";
import { QUERY_KEYS } from "../../lib/constants";

export function useDeleteStorage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storage) => deleteStorageStructure(storage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storage.all });
      queryClient.invalidateQueries({queryKey: QUERY_KEYS.rack.all})
    },
  });
}
