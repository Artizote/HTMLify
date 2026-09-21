import { PageShell } from "@/components/page-shell";
import TmpFolderForm from "@/components/tmp-folder/tmp-folder-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TempFolderPage = () => {
  return (
    <PageShell
      title="Temporary Folder Links"
      description="Create a folder, upload files, and share them with a single link."
      titleClassName="text-left md:text-left"
    >
      <Card className="border-border/50 shadow-xl bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Files you drop are uploaded automatically and share the same folder
            link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TmpFolderForm />
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default TempFolderPage;
