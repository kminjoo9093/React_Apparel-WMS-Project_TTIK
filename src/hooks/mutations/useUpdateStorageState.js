import { useMutation } from "@tanstack/react-query";
import { updateStorageState } from "../../api/storage/fetchStorageData";

export function useUpdateStorageState() {
  return useMutation({
    mutationFn: (storageModifyReq) => updateStorageState(storageModifyReq),
  });
}
