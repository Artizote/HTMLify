import { Navbar } from "@/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="container pt-10 px-4 mx-auto">
        <Navbar />
      </div>
      <main className="container mx-auto pt-10">{children}</main>
    </>
  );
}
