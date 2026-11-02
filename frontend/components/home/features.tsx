import Link from "next/link";


const features = [
  {
    title: "File Hosting",
    desc: "Upload/Write HTML, CSS, JavaScript, images, documents, and more. Get a permanent, shareable URL for every file.",
  },
  {
    title: "Code Pens & Live Preview",
    desc: "Create, edit, and preview your code in real time with a built-in editor and syntax highlighting.",
  },
  {
    title: "URL ShortLinks",
    desc: "Turn long URLs into short, easy-to-share links. No account needed.",
  },
  {
    title: "Temporary File Hosting",
    desc: "Need to share a file temporarily? Upload it and get a shareable link without setting up permanent hosting or creating an account.",
  },
  {
    title: "Temporary Folder Hosting",
    desc: "Share multiple files together through a single temporary folder link. No account required.",
  },
  {
    title: "Community Showcase",
    desc: "Explore Frames, a public gallery of HTML pages published by the community. Discover what others have uploaded and share inspiration.",
  },
  {
    title: "Developer API",
    desc: "Integrate with the platform programmatically. Access the features you need through our API and automate your file hosting, temporary uploads, shortlinks, and more.",
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
              Features focused on making hosting and sharing effortless for Developers
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="font-mono text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                goto Dashboard;
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
