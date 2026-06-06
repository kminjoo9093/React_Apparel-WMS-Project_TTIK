import { useMutation } from "@tanstack/react-query";
import { checkProductCdExists } from "../../api/product/fetchProductRegisterData";

export function useProductCodeCheck(productCd){
  return useMutation({
    mutationFn: (productCd) => checkProductCdExists(productCd)
  })
}