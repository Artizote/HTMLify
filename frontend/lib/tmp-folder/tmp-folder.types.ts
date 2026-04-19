export interface TmpFolderResponse {
  id: string;
  name: string;
  files: string[];
  auth_code: string;
}

export interface TmpFolderFile {
  id: string;
  name: string;
  url: string;
  expiry: string;
}
