import { useMutation } from "@tanstack/react-query";
import { createProductCd } from "../../api/product/fetchProductRegisterData";

export function useProductCode(productInfo) {
  return useMutation({
    mutationFn: (productInfo) => createProductCd(productInfo),
  });
}
