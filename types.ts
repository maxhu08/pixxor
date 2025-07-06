export interface AlbumMember {
  id: string;
  name: string;
  role: AlbumMemberRole;
}

export enum AlbumMemberRole {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER"
}

export type ImageEffect = "monotone" | "inverted" | "horizontal-flip" | "vertical-flip";
