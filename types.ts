export interface AlbumMember {
  id: string;
  name: string;
  role: string;
}

export enum AlbumMemberRole {
  ADMIN,
  MEMBER,
  VIEWER,
}
