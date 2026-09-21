import Link from "next/link";

const features = [
  {
    title: "Pens & Code Editor",
    desc: "Write, preview, and share code snippets with a built-in editor. Supports multiple languages with syntax highlighting.",
  },
  {
    title: "File Hosting",
    desc: "Upload any file - images, documents, archives - and get a permanent shareable link with one click.",
  },
  {
    title: "URL Shortlinks",
    desc: "Turn long, messy URLs into clean, memorable shortlinks. Track clicks and manage your links.",
  },
  {
    title: "Temp File Links",
    desc: "Need to share something quickly? Generate expiring links that auto-delete after use.",
  },
  {
    title: "QR Code Generator",
    desc: "Instantly generate QR codes for any link. Perfect for sharing on the go.",
  },
  {
    title: "Search Everything",
    desc: "Find your files, pens, and links instantly with built-in search across all your content.",
  },
];

export function Features() {
  return (
    <section className="border-t border-border px-6 lg:px-12 py-24 lg:py-32">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
          <div className="md:w-1/2">
            <span className="font-mono text-xs text-muted-foreground/60 tracking-widest uppercase">
              # features
            </span>
            <h2 className="font-mono text-4xl lg:text-5xl text-foreground mt-3 mb-5 leading-[1.1] tracking-tight">
              Everything you need.
            </h2>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">
              A complete toolkit for developers who want to ship fast. Code
              pens, file hosting, shortlinks, temp sharing, and more - all in
              one place.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="font-mono text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                Browse files →
              </Link>
              <Link
                href="/dashboard/file/new"
                className="font-mono text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                Start writing →
              </Link>
            </div>
          </div>

          <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2  rounded-md overflow-hidden">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card/40 hover:bg-card p-5 lg:p-6 group"
              >
                <h3 className="font-mono text-sm font-semibold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="font-mono text-xs text-muted-foreground/80 leading-relaxed mb-4">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
