import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";
import { FramesFeedResponse } from "@/lib/modules/frames/frames.types";

const getFramesFeed = async (n: number) => {
  try {
    const res = await APICall(
      `${env.NEXT_PUBLIC_BACKEND_API_URL}/internal/frames/feed?n=${n}`,
    );

    return res.json() as Promise<FramesFeedResponse[]>;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export { getFramesFeed };
