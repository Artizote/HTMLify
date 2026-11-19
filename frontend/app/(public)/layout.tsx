import { Navbar } from "@/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-1 min-h-0 pt-20 flex flex-col">{children}</main>
    </div>
  );
}
