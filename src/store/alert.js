import { create } from "zustand";

export const useAlertStore = create((set) => ({
  alert: {
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  },

  openAlert: ({ title = "", message = "", onConfirm=()=>{}, onCancel=()=>{} }) => {
    set((state) => ({
      alert: {
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          if (onConfirm) onConfirm();
          state.closeAlert();
        },
        onCancel: () => {
          if (onCancel) onCancel();
          state.closeAlert();
        },
      },
    }));
  },

  closeAlert: () => {
    set((state) => ({
      alert: { isOpen: false, ...state.alert },
    }));
  },
}));

export const useAlertState = () => {
  const alertState = useAlertStore((store) => store.alert);
  return alertState;
};

export const useOpenAlert = () => {
  const openAlert = useAlertStore((store) => store.openAlert);
  return openAlert;
};

export const useCloseAlert = () => {
  const closeAlert = useAlertStore((store) => store.closeAlert);
  return closeAlert;
};
