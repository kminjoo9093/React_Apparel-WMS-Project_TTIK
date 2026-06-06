import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerStorage } from "../../api/storage/fetchStorageData";
import { QUERY_KEYS } from "../../lib/constants";

export function useRegisterStorage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newStorage) => registerStorage(newStorage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storage.all });
    },
  });
}
