import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Props {
  path: string;
}

export function DashboardBreadcrumb({ path }: Props) {
  const segments = path.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="font-mono">
              ~
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((seg, i) => {
          const href = "/dashboard?path=/" + segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;

          return (
            <BreadcrumbItem key={`${seg}-${i}`}>
              <BreadcrumbSeparator />
              {isLast ? (
                <BreadcrumbPage>{seg}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={href}>{seg}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
