export interface TmpFile {
  id: string;
  name: string;
  url: string;
  expiry: string;
}

export interface TmpFormType {
  file: File | null;
  name?: string;
  expiry: number;
}
