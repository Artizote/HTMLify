import { TmpForm } from "@/components/tmp/TmpForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TmpPage = () => {
  return (
    <div className="w-full px-8 py-6">
      <Card className="max-w-6xl mx-auto border-border/50 shadow-lg bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Temporary File Links</CardTitle>
        </CardHeader>
        <CardContent>
          <TmpForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default TmpPage;
