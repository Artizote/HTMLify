"use client";

import { TmpForm } from "@/components/tmp/tmp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TmpPage = () => {
  return (
    <div className="w-full px-8 pt-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Temporary File Links
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload files and generate secure, self-destructing links with custom
            expiry.
          </p>
        </div>

        <Card className="border-border/50 shadow-xl bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Generate Link</CardTitle>
            <CardDescription>
              Your files will be automatically deleted after the specified time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TmpForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TmpPage;
