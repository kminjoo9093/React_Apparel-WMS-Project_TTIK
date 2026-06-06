import { useMutation } from "@tanstack/react-query";
import { registerStorage } from "../../api/storage/fetchStorageData";

export function useRegisterStorage() {
  return useMutation({
    mutationFn: (newStorage) => registerStorage(newStorage),
  });
}
