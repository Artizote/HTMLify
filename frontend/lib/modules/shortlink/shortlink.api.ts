import { env } from "@/lib/env";
import { APIError, parseServerError } from "@/lib/errors";
import { APICall } from "@/lib/fetch/api";

import { ShortLink } from "./shortlink.types";
export const getOriginalUrlFromShort = async (
  short: string,
): Promise<ShortLink> => {
  const response = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/shortlinks/${short}`,
  );

  if (!response.ok) {
    const message = await parseServerError(
      response,
      `Failed to fetch source link for short: ${short}`,
    );
    throw new APIError(message, response.status);
  }
  return (await response.json()) as ShortLink;
};

export const createShortLink = async (
  href: string,
  isNew: boolean = false,
): Promise<ShortLink> => {
  const response = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/shortlinks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ href, new: isNew }),
    },
  );

  if (!response.ok) {
    const message = await parseServerError(
      response,
      "Failed to create short link",
    );
    throw new APIError(message, response.status);
  }
  return (await response.json()) as ShortLink;
};
