import { FramesContent } from "@/components/frames/frames-content";
import { getFramesFeed } from "@/lib/modules/frames/frames.api";

const FramesPage = async () => {
  const frames = await getFramesFeed(10);
  if (!frames || frames.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        No frames found
      </div>
    );
  }
  return <FramesContent initialFrames={frames} />;
};

export default FramesPage;
