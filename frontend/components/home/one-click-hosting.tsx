import {
  GoLang,
  HTML,
  JavaScript,
  Python,
  Rust,
  TypeScript,
} from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";

const icons = [
  {
    icon: Python,
  },
  {
    icon: HTML,
  },
  {
    icon: GoLang,
  },
  {
    icon: JavaScript,
  },
  {
    icon: TypeScript,
  },
  {
    icon: Rust,
  },
];

export function OneClickHosting() {
  return (
    <div className="w-full text-center min-h-screen flex flex-col items-center gap-4  justify-center">
      <h1 className="text-4xl text-center font-bold leading-tight">
        Share anything. In any language. Instantly.
      </h1>
      <p>
        One platform for every stack — no config headaches, no lock-in, just one
        click.
      </p>
      <div className="flex gap-4 flex-wrap items-center justify-center">
        {icons.map((icon, index) => (
          <Card key={index}>
            <CardContent className="">
              <icon.icon className="h-12 w-12 drop-shadow-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
