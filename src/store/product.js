import { create } from "zustand";

const useProductStore = create((set) => ({
  formData: {
    brandCd: "",
    productNm: "",
    category: "",
    seasonCd: "",
    sizeCd: "",
    styleNo: "",
    inboxQty: "",
    price: "",
    threshold: "",
  },
  errors: {
    qty: false, // 박스 입수량
    price: false, // 단가
    threshold: false, // 임계치
  },
  errorMsg: {
    qty: "",
    price: "",
    threshold: "",
  },
  productCd: "",

  // 상태변경 액션
  actions: {
    setFormData: (partial) => {
      set((state) => ({
        formData: { ...state.formData, ...partial },
      }));
    },
    setErrors: (name, isInvalid, message) => {
      set((state) => ({
        errors: { ...state.errors, [name]: isInvalid },
        errorMsg: { ...state.errorMsg, [name]: message },
      }));
    },
    setProductCd: (code) => set({ productCd: code }),
    resetFormData: () => 
      set({
        formData: {
          brandCd: "",
          productNm: "",
          category: "",
          seasonCd: "",
          sizeCd: "",
          styleNo: "",
          inboxQty: "",
          price: "",
          threshold: "",
        },
        errors: {
          qty: false,
          price: false,
          threshold: false,
        },
        errorMsg: {
          qty: "",
          price: "",
          threshold: "",
        },
        productCd: "",
      }),
  },
}));

export const useFormData = () => {
  const formData = useProductStore((store)=>store.formData);
  return formData;
}

export const useErrors = () => {
  const errors = useProductStore((store)=>store.errors);
  return errors;
}

export const useErrorMsg = () => {
  const errorMsg = useProductStore((store)=>store.errorMsg);
  return errorMsg;
}

export const useProductCd = () => {
  const productCd = useProductStore((store)=>store.productCd);
  return productCd;
}

export const useSetFormData = () => {
  const setFormData = useProductStore((store)=>store.actions.setFormData);
  return setFormData;
}

export const useSetErrors = () => {
  const setErrors = useProductStore((store)=>store.actions.setErrors);
  return setErrors;
}

export const useSetProductCd = () => {
  const setProductCd = useProductStore((store)=>store.actions.setProductCd);
  return setProductCd;
}

export const useResetFormData = () => {
  const resetFormData = useProductStore((store)=>store.actions.resetFormData);
  return resetFormData;
}
