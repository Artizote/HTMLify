const cards = [
  {
    title: "Share with Anyone",
    desc: "Every file gets its own permanent, predictable URL, making sharing and accessing your content effortless.",
  },
  {
    title: "Multi-Language Syntax Highlighting",
    desc: "Beautifully formatted code snippets with rich syntax highlighting across a wide range of programming languages.",
  },
  {
    title: "One-Click Publishing",
    desc: "Upload your content and make it instantly accessible on the web.",
  },
  {
    title: "Temp File Hosting",
    desc: "Just need a quick and temporary host? He got you, upload files and share them instantly without permanent hosting.",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-24 md:py-28">
        <div className="max-w-3xl">
          <span className="font-mono text-xs text-muted-foreground/60 tracking-widest uppercase">
            # code - host - share
          </span>

          <h1 className="mt-3 font-mono text-3xl  leading-[1.05] tracking-[-0.08em] text-foreground lg:text-5xl">
            If it's HTML, HTMLify it!
          </h1>

          <p className="mt-8 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            The platform built for developers to host webpages and code snippets.
            Publish your projects to the web and bring them to life just one click.
          </p>
        </div>

        <div className="mt-16 grid max-w-4xl gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  rounded-md overflow-hidden">
          {cards.map((c) => (
            <div key={c.title} className="   p-4 pl-0">
              <h3 className="font-mono text-sm font-semibold text-foreground mb-2">
                {c.title}
              </h3>
              <p className="font-mono text-xs text-muted-foreground/80 leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
