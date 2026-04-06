import { create } from "zustand";

export const useProductModal = create((set) => ({
  modalConfig: {
    isOpen: false,
    type: null,
    props: null,
  },

  //액션
  openModal: (type, props = {}) =>
    set({
      modalConfig: { isOpen: true, type, props },
    }),

  closeModal: () =>
    set({ modalConfig: { isOpen: false, type: null, props: null } }),
}));

export const useModalConfig = () => {
  const modalConfig = useProductModal((store) => store.modalConfig);
  return modalConfig;
};

export const useOpenModal = () => {
  const openModal = useProductModal((store) => store.openModal);
  return openModal;
};

export const useCloseModal = () => {
  const closeModal = useProductModal((store) => store.closeModal);
  return closeModal;
};
