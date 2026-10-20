export interface TmpFolderFile {
  id: string;
  name: string;
  url: string;
  expiry: string;
}

export interface TmpFolderResponse {
  id: string;
  name: string;
  files: TmpFolderFile[];
  auth_code: string;
}

export type TmpFolderMeta = Omit<TmpFolderResponse, "auth_code">;
