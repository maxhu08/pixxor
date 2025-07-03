export interface AlbumMember {
  id: string;
  name: string;
  role: AlbumMemberRole;
}

export enum AlbumMemberRole {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}
