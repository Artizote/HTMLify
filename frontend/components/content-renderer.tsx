import Image from "next/image";
import React from "react";

interface ContentRenererProps {
  fileType: "text" | "img" | "video" | "audio" | "other";
  response: Response;
}
export const ContentRenerer = ({ fileType, response }: ContentRenererProps) => {
  switch (fileType) {
    case "img":
      return <Image src={response.url} alt="" />;
  }
  return <div>ContentRenerer</div>;
};
