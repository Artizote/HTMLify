export type ShortLink = {
  id: number;
  href: string;
  short: string;
  hits: number;
  url: string;
};

export interface ShortLinkFormType {
  herf: string;
  new: boolean;
}
