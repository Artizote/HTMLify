import { Shortlink } from "@/components/shortlink/Shortlink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ShortlinkPage = () => {
  return (
    <div className="w-full px-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Shortlink</CardTitle>
        </CardHeader>
        <CardContent>
          <Shortlink />
        </CardContent>
      </Card>
    </div>
  );
};

export default ShortlinkPage;
