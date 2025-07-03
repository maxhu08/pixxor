import { AlbumMember, AlbumMemberRole } from "@/types";
import { create } from "zustand";

export type DialogType =
  | "sign-out"
  | "create-album"
  | "manage-album"
  | "invite-members-to-album"
  | "upload-image-to-album"
  | "manage-album-member-role";

interface DialogData {
  uploadImageToAlbumData?: {
    albumId: string;
    onSuccess?: () => void;
  };
  manageAlbumData?: {
    albumId: string;
    members: AlbumMember[];
  };
  manageAlbumMemberRoleData?: {
    albumId: string;
    member: {
      id: string;
      name: string;
    };
    currentRole: AlbumMemberRole;
  };
}

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
