import { ArrowRight, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WordRotate } from "@/components/ui/word-rotate";
import { env } from "@/lib/env";

export function Hero() {
  return (
    <section>
      <div className="flex flex-col min-h-[calc(100vh-100px)] space-y-2 items-left max-w-4xl mx-auto justify-center px-4">
        <p className="text-xl md:text-2xl font-medium opacity-60">
          Give your code
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter [word-spacing:-6px] flex flex-wrap items-center">
          A New
          <WordRotate
            className="text-4xl md:text-6xl font-bold text-primary ml-4"
            words={["Life", "Meaning", "Style", env.NEXT_PUBLIC_SITE_NAME]}
          />
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          The ultimate platform for deploying and hosting your web projects.
          HTMLify makes it effortless to launch your static sites and modern web
          applications to a global edge network in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            size="lg"
            className="h-12 px-8 rounded-lg w-full sm:w-auto text-base"
          >
            Start Generating <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 rounded-lg w-full sm:w-auto text-base"
          >
            <Github className="mr-2 h-4 w-4" /> View on GitHub
          </Button>
        </div>
      </div>
    </section>
  );
}
