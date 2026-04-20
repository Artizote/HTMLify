"use client";
import { Eye, Monitor, Smartphone, Tablet, User } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFramesFeed } from "@/lib/modules/frames/frames.api";
import { FramesFeedResponse } from "@/lib/modules/frames/frames.types";

import { FramesSidebar } from "./sidebar";

const DEVICE_WIDTHS = {
  mobile: "390px",
  tablet: "768px",
  desktop: "100%",
} as const;

type Device = keyof typeof DEVICE_WIDTHS;
const DeviceTabs = ({
  device,
  setDevice,
}: {
  device: Device;
  setDevice: Dispatch<SetStateAction<Device>>;
}) => {
  return (
    <Tabs
      value={device}
      onValueChange={(v) => setDevice(v as Device)}
      className="hidden md:block"
    >
      <TabsList className="bg-muted/50 border shadow-sm">
        <TabsTrigger
          value="mobile"
          className="data-[state=active]:bg-background"
        >
          <Smartphone className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger
          value="tablet"
          className="data-[state=active]:bg-background"
        >
          <Tablet className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger
          value="desktop"
          className="data-[state=active]:bg-background"
        >
          <Monitor className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

interface FramesContentProps {
  initialFrames: FramesFeedResponse[];
}
export const FramesContent = ({ initialFrames }: FramesContentProps) => {
  const [device, setDevice] = useState<Device>("desktop");
  const [frames, setFrames] = useState<FramesFeedResponse[]>(initialFrames);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = frames[currentIdx].url;
    }
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = async () => {
    if (currentIdx < frames.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      return;
    }

    setIsFetching(true);
    const newFrames = await getFramesFeed(10);
    if (newFrames && newFrames.length > 0) {
      setFrames((prev) => [...prev, ...newFrames]);
      setCurrentIdx((prev) => prev + 1);
    }
    setIsFetching(false);
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = frames[currentIdx].url;
    }
  };

  if (frames.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground bg-muted/10">
        No frames available
      </div>
    );
  }

  return (
    <FramesSidebar
      currentURL={frames[currentIdx].url}
      handleNext={handleNext}
      handleBack={handleBack}
      handleReload={handleReload}
      isFetching={isFetching}
    >
      <div className="h-full flex flex-col p-4 gap-2 bg-muted/20">
        <div className="flex items-center justify-between">
          <DeviceTabs device={device} setDevice={setDevice} />
        </div>

        <div className="flex-1 min-h-0 bg-muted-foreground/5 rounded-md flex justify-center w-full relative">
          <div
            className="h-full transition-[width] duration-500 ease-in-out relative group"
            style={{ width: DEVICE_WIDTHS[device] }}
          >
            <div
              className="absolute -inset-0.5 bg-linear-to-b from-border/50 
            to-border/10 rounded-[1.2rem] blur-[2px] opacity-20 group-hover:opacity-40 transition-opacity"
            />

            <div className="h-full w-full rounded-md border  shadow-2xl relative overflow-hidden">
              <iframe
                ref={iframeRef}
                className="h-full w-full transition-all duration-500 ease-in-out"
                title="Block preview"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between w-fit gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{frames[currentIdx].user}</p>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{frames[currentIdx].views}</p>
          </div>
        </div>
      </div>
    </FramesSidebar>
  );
};
