import { cn } from "@/lib/utils";

interface PageShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export function PageShell({
  title,
  description,
  children,
  className,
  titleClassName,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "w-full px-8 pt-10 flex flex-col items-center justify-center",
        className,
      )}
    >
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className={cn("space-y-2", titleClassName)}>
          <h1 className="text-3xl md:text-4xl font-mono tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-lg">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
