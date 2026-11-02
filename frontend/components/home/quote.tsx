"use client";

import DotPattern from "@/components/ui/dot-pattern";

export function Quote() {
  return (
    <>
      <div className="mx-auto flex items-center justify-center min-h-screen  max-w-7xl px-6 md:mb-20 xl:px-0">
        <div className="relative flex flex-col items-center px-5 border border-primary">
          <DotPattern width={5} height={5} />

          <div className="absolute -left-1.5 -top-1.5 h-3 w-3 bg-primary text-foreground" />
          <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 bg-primary text-foreground" />
          <div className="absolute -right-1.5 -top-1.5 h-3 w-3 bg-primary text-foreground" />
          <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-primary text-foreground" />

          <div className="relative z-20 mx-auto max-w-7xl rounded-[40px] py-6 md:p-10 xl:py-20">
            <p className="md:text-md text-xs font-medium text-primary lg:text-lg xl:text-2xl">
              We believe
            </p>
            <div className="text-2xl tracking-tighter md:text-5xl lg:text-6xl xl:text-7xl">
              <div className="flex gap-1 md:gap-2 lg:gap-2 xl:gap-3">
                <h1 className="">&quot;Hosting </h1>
                <p className="font-thin">and</p>
                <h1 className="">Sharing</h1>
              </div>
              <div className="flex gap-1 md:gap-2 lg:gap-2 xl:gap-3">
                <p className="font-thin">code should be</p>
                <h1 className="">fast, secure</h1>
              </div>
              <div className="flex gap-1 md:gap-2 lg:gap-2 xl:gap-3">
                <p className="font-thin">and </p>
                <h1 className="">effortless</h1>
                <p className="font-thin">for everyone,</p>
              </div>
              <p className="font-thin">anywhere.&quot;</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
