export interface AlbumMember {
  id: string;
  name: string;
  role: AlbumMemberRole;
}

export enum AlbumMemberRole {
  ADMIN,
  MEMBER,
  VIEWER,
}
