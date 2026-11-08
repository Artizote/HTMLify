import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";
import { ShortLink } from "./shortlink.types";


export const getOriginalUrlFromShort = async (
  short: string,
): Promise<ShortLink | null> => {
  const { response: response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/shortlinks/${short}`,
  );

  if (error) {
    return null;
  }

  return (await response?.json()) as ShortLink;
};

export async function getShortLinkById(id: number) {
  const { response, error } = await APICall(`${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/shortlinks?id=${id}`);
  if (error) { return null; }
  return (await response?.json()) as ShortLink;
}

export async function getShortLinkByShort(short: string) {
  const { response, error } = await APICall(`${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/shortlinks?short=${short}`);
  if (error) { return null; }
  return (await response?.json()) as ShortLink;
}

export const createShortLink = async (
  href: string,
  isNew: boolean = false,
): Promise<{ data: ShortLink | null; error: string | null }> => {
  const { response: response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/shortlinks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ href, new: isNew }),
    },
  );

  if (error) {
    return { data: null, error };
  }
  return { data: (await response?.json()) as ShortLink, error: null };
};

export async function hitShortLink(id: number) {
  await APICall(`${env.NEXT_PUBLIC_BACKEND_API_URL}/internal/shortlink/hit?id=${id}`);
};
