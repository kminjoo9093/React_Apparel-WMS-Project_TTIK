import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerProduct } from "../../api/product/fetchProductRegisterData";
import { QUERY_KEYS } from "../../lib/constants";

export function useRegisterProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) => registerProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product.list });
    },
  });
}
