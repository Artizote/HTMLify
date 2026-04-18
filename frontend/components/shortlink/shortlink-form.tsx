"use client";
import { useState } from "react";
import z from "zod";

import { ShortResult } from "@/components/shortlink/short-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useShortLink } from "@/lib/modules/shortlink/shortlink.quries";
import { ShortLink as ShortLinkType } from "@/lib/modules/shortlink/shortlink.types";

const urlSchema = z.string().url("Please enter a valid URL");

export const Shortlink = () => {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const { mutate: shortLinkMutate } = useShortLink();
  const [shortLinkResult, setShortLinkResult] =
    useState<ShortLinkType | null>();
  const [isNew, setIsNew] = useState(false);

  const handleSubmit = () => {
    const result = urlSchema.safeParse(url);
    if (!result.success) {
      setUrlError(result.error.errors[0].message);
      return;
    }

    shortLinkMutate(
      { herf: url, new: isNew },
      {
        onSuccess: (data) => {
          setShortLinkResult(data);
          setUrl("");
          setUrlError("");
        },
        onError: (e) => {
          setUrlError(e.message);
        },
      },
    );
  };
  return (
    <div>
      <div className="flex items-start md:items-center  gap-4 flex-col md:flex-row">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter your link"
          className=" w-full"
        />
        <Button onClick={handleSubmit}>Shorten</Button>
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <Switch id="new-link-mode" checked={isNew} onCheckedChange={setIsNew} />
        <Label
          htmlFor="new-link-mode"
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Create unique link
        </Label>
      </div>

      {urlError && (
        <p className="text-destructive text-sm mt-4 bg-destructive/10 p-2 w-fit rounded-md">
          {urlError}
        </p>
      )}

      {shortLinkResult && (
        <ShortResult shortLink={shortLinkResult} className="mt-2" />
      )}
    </div>
  );
};
