import { useMutation } from "@tanstack/react-query";
import { registerProduct } from "../../api/product/fetchProductRegisterData";

export function useRegisterProduct() {
  return useMutation({
    mutationFn: (productData) => registerProduct(productData),
  });
}
