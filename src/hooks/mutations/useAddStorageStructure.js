import { useMutation } from "@tanstack/react-query";
import { addStorageStructure } from "../../api/storage/fetchStorageData";

export function useAddStorageStructure() {
  return useMutation({
    mutationFn: (storageAddReq) => addStorageStructure(storageAddReq),
  });
}
