import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CodeTerminal } from "@/components/code-share/code-terminal";

interface CodeSidebarProps {
  code: string;
  language: string;
  children?: React.ReactNode;
}

export function RunCodeDrawer({ code, language, children }: CodeSidebarProps) {
  const isHtml = language === "html" || language === "xml";

  return (
    <Drawer>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent className="flex flex-col h-full mx-4 border border-primary">
        <DrawerHeader className="px-0 pb-0">
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              <DrawerTitle className="text-sm font-semibold">
                Preview
              </DrawerTitle>
              <Badge
                variant="secondary"
                className="text-xs font-mono uppercase"
              >
                {language}
              </Badge>
            </div>
            <DrawerClose asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Close
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription className="sr-only">
            View HTML preview
          </DrawerDescription>
        </DrawerHeader>
        {isHtml ? (
          <iframe
            srcDoc={code}
            className="w-full h-full  border-0 bg-white"
            sandbox="allow-scripts allow-same-origin"
            title="HTML Preview"
          />
        ) : (
          <CodeTerminal />
        )}
      </DrawerContent>
    </Drawer>
  );
}
