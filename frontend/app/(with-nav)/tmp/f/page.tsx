"use client";

import { FolderPlus } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import TmpFolderForm from "@/components/tmp-folder/tmp-folder-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTmpFolderStore } from "@/lib/hooks/use-tmp-folder";

const TempFolderPage = () => {
  const { folder, resetFolder } = useTmpFolderStore();

  return (
    <PageShell
      title="Temp Folder"
      description="Create a folder, upload files, and share them with a single URL."
      titleClassName="text-left"
    >
      <Card className="border-border/50 shadow-xl bg-background/50 backdrop-blur-sm">
        <CardHeader>
          {folder ? (
            <CardTitle className="font-mono truncate">
              {folder.name}
            </CardTitle>
          ) : (
            <>
              <CardTitle>Create a Folder</CardTitle>
              <CardDescription>
                Create a folder to start uploading files.
              </CardDescription>
            </>
          )}
          {folder && (
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFolder}
              >
                <FolderPlus className="size-4 mr-2" />
                New Folder
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <TmpFolderForm />
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default TempFolderPage;