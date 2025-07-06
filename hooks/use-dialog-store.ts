import { AlbumMember, AlbumMemberRole } from "@/types";
import { create } from "zustand";

export type DialogType =
  | "sign-out"
  | "create-album"
  | "delete-album"
  | "manage-album"
  | "invite-members-to-album"
  | "upload-image-to-album"
  | "manage-album-member-role"
  | "remove-album-member"
  | "view-photo"
  | "add-effects"
  | "delete-photo";

interface DialogData {
  deleteAlbumData?: {
    albumId: string;
    onAlbumDeleted?: () => void;
  };
  uploadImageToAlbumData?: {
    albumId: string;
    onSuccess: (newImage: any) => void;
  };
  manageAlbumData?: {
    albumId: string;
    members: AlbumMember[];
  };
  inviteMembersToAlbumData?: {
    albumId: string;
  };
  manageAlbumMemberRoleData?: {
    albumId: string;
    member: {
      id: string;
      name: string;
    };
    currentRole: AlbumMemberRole;
    onAlbumMemberRoleUpdated: (memberId: string, newRole: AlbumMemberRole) => void;
  };
  removeAlbumMemberData?: {
    albumId: string;
    memberId: string;
    onAlbumMemberRemoved: () => void;
  };
  createAlbumData?: {
    onSuccess?: () => void;
  };
  viewPhotoData?: {
    photoUrl: string;
    photoId: string;
    onAddEffects: () => void;
  };
  addEffectsData?: {
    photoId: string;
    onEffectsApplied?: () => void;
  };
  deletePhotoData?: {
    photoId: string;
    onPhotoDeleted?: () => void;
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
      data: { ...state.data, ...newData }
    })),
  close: () => set({ type: null, isOpen: false })
}));
