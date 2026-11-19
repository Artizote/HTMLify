"use client";

import { PageShell } from "@/components/page-shell";
import { TmpForm } from "@/components/tmp/tmp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const TmpPage = () => {
  return (
    <PageShell
      title="Temp File"
      description="Upload a temporary file and get a public link. It is automatically deleted after the chosen expiry."
      titleClassName="text-left"
    >
      <Card className="border-border/50 shadow-xl bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Your files will be automatically deleted after the specified time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TmpForm />
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground text-center">
        Need to share multiple files? Use a{" "}
        <Link
          href="/tmp/f"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Temp Folder
        </Link>{" "}
        instead.
      </p>
    </PageShell>
  );
};

export default TmpPage;
