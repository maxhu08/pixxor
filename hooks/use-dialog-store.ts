import { create } from "zustand";

export type DialogType =
  | "sign-out"
  | "create-album"
  | "manage-album"
  | "invite-members-to-album";

interface DialogData {}

interface DialogStore {
  type: DialogType | null;
  data: DialogData;
  isOpen: boolean;
  open: (type: DialogType, data?: DialogData) => void;
  close: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  open: (type, newData = {}) =>
    set((state) => ({
      isOpen: true,
      type,
      data: { ...state.data, ...newData },
    })),
  close: () => set({ type: null, isOpen: false }),
}));
